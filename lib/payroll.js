/**
 * ════════════════════════════════════════════════════════════════
 * HISOB-KITOB MANTIQI
 * ════════════════════════════════════════════════════════════════
 * Kechikish, jarima va kunlik daromad shu yerda hisoblanadi.
 * Butun tizimning pul bilan bog'liq qismi shu faylda jamlangan —
 * qoidani o'zgartirish kerak bo'lsa, faqat shu yerni tahrirlash
 * yetarli.
 *
 * Formula:
 *   kunlik daromad = kunlik stavka − kechikish jarimasi
 *   oylik          = Σ kunlik daromad − avanslar
 * ════════════════════════════════════════════════════════════════
 */

import { DEFAULT_SETTINGS, STATUS } from './constants'
import { hhmmToMinutes } from './utils'

/**
 * Sozlamalarni standart qiymatlar bilan to'ldiradi.
 * Bazadan yarim to'la hujjat kelsa ham hisob buzilmaydi.
 */
export function withDefaults(settings) {
  const s = settings || {}
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    tiers: Array.isArray(s.tiers) && s.tiers.length ? s.tiers : DEFAULT_SETTINGS.tiers,
    telegram: { ...DEFAULT_SETTINGS.telegram, ...(s.telegram || {}) },
  }
}

/**
 * Kechikish daqiqalari.
 *
 * Kechasi ishlaydigan smenalar uchun: qorovul smenasi 20:00 da
 * boshlanib, u 20:15 da kelsa — 15 daqiqa kechikish. Ammo agar
 * kelgan vaqt smenadan 12 soatdan ko'proq "oldin" chiqsa, demak
 * bu ertasi kunning erta tongi — sutka chegarasidan o'tgan deb
 * hisoblaymiz.
 *
 * @returns {number} 0 yoki musbat daqiqa. Erta kelgan bo'lsa 0.
 */
export function lateMinutes(checkIn, shiftStart) {
  const a = hhmmToMinutes(checkIn)
  const b = hhmmToMinutes(shiftStart)
  if (a === null || b === null) return 0

  let diff = a - b
  if (diff < -720) diff += 1440 // sutka chegarasidan o'tgan tungi smena

  return diff > 0 ? diff : 0
}

/**
 * Kechikish uchun jarima summasi.
 *
 * @param {number} late      kechikish daqiqalari
 * @param {number} dailyRate kunlik stavka (so'm)
 * @param {object} settings  jarima qoidalari
 * @returns {number} jarima so'mda (butun son)
 */
export function penaltyFor(late, dailyRate, settings) {
  const s = withDefaults(settings)
  const rate = Number(dailyRate) || 0

  // Erkinlik vaqti ichida kechikish jarimasiz
  const billable = Math.max(0, (Number(late) || 0) - s.graceMinutes)
  if (billable <= 0 || rate <= 0) return 0

  let amount = 0

  if (s.penaltyMode === 'per_minute') {
    amount = billable * (Number(s.perMinuteAmount) || 0)
  } else {
    // Pog'onali: kechikishga mos keladigan eng yuqori pog'onani topamiz
    const tier = [...s.tiers]
      .sort((x, y) => y.minutes - x.minutes)
      .find((t) => billable >= (Number(t.minutes) || 0))
    amount = tier ? (rate * (Number(tier.percent) || 0)) / 100 : 0
  }

  // Jarima kunlik stavkadan (yoki belgilangan chegaradan) oshmasin —
  // aks holda ishchi kuni bo'yicha "qarzdor" bo'lib qolardi
  const cap = (rate * (Number(s.maxPenaltyPercent) || 100)) / 100
  return Math.min(Math.round(amount), Math.round(cap))
}

/**
 * Bir kunlik davomatni to'liq hisoblaydi.
 *
 * @param {object}  p
 * @param {string}  p.status      'keldi' | 'kelmadi' | 'dam' | 'kasal'
 * @param {string}  p.checkIn     kelgan vaqt 'HH:MM' (status 'keldi' bo'lsa)
 * @param {string}  p.shiftStart  smena boshlanishi 'HH:MM'
 * @param {number}  p.dailyRate   kunlik stavka
 * @param {object}  p.settings    jarima qoidalari
 * @returns {{status: string, late: number, penalty: number, earned: number}}
 */
export function calcDay({ status, checkIn, shiftStart, dailyRate, settings }) {
  const s = withDefaults(settings)
  const rate = Number(dailyRate) || 0
  const start = shiftStart || s.defaultShiftStart

  // Kelmagan / dam olgan / kasal — jarima ham, to'lov ham yo'q
  if (status && status !== 'keldi' && status !== 'kech') {
    return { status, late: 0, penalty: 0, earned: 0 }
  }

  const late = lateMinutes(checkIn, start)
  const penalty = penaltyFor(late, rate, s)

  return {
    status: late > s.graceMinutes ? 'kech' : 'keldi',
    late,
    penalty,
    earned: Math.max(0, rate - penalty),
  }
}

/**
 * Bir xodimning oylik yakuni.
 *
 *   yakuniy = hisoblangan − jarima − avans − ushlanma
 *
 * Uch xil ushlab qolish bir-biridan farq qiladi va alohida
 * ko'rsatiladi, chunki sabablari boshqa-boshqa:
 *   jarima   — kechikkani uchun, davomatdan avtomatik chiqadi
 *   avans    — pulni oldindan olgan, qarz emas
 *   ushlanma — zimmasiga yozilgan (singan idish, kam chiqqan kassa)
 *
 * @param {Array} records   shu xodimning oy davomidagi attendance yozuvlari
 * @param {Array} advances  shu xodimning oydagi avanslari
 * @param {Array} charges   shu xodim zimmasiga yozilgan summalar
 */
export function monthlyTotal(records = [], advances = [], charges = []) {
  const totals = {
    ishlagan: 0,     // haqiqatda kelgan kunlar (o'z vaqtida + kechikkan)
    kechikkan: 0,    // shundan kechikkan kunlar
    kelmagan: 0,
    dam: 0,
    kasal: 0,
    kechikishDaq: 0, // umumiy kechikish daqiqalari
    hisoblangan: 0,  // jarimasiz umumiy summa
    jarima: 0,
    avans: 0,
    ushlanma: 0,
    yakuniy: 0,
  }

  for (const r of records) {
    const paid = STATUS[r.status]?.paid

    if (paid) {
      totals.ishlagan += 1
      if (r.status === 'kech') totals.kechikkan += 1
      totals.kechikishDaq += Number(r.late) || 0
      totals.hisoblangan += Number(r.dailyRate) || 0
      totals.jarima += Number(r.penalty) || 0
    } else if (r.status === 'kelmadi') {
      totals.kelmagan += 1
    } else if (r.status === 'dam') {
      totals.dam += 1
    } else if (r.status === 'kasal') {
      totals.kasal += 1
    }
  }

  totals.avans = advances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0)
  totals.ushlanma = charges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  totals.yakuniy = totals.hisoblangan - totals.jarima - totals.avans - totals.ushlanma

  return totals
}

/**
 * To'lov holati: qancha berilishi kerak, qancha berilgan, qancha qoldi.
 * Kassa bo'limi shu funksiyadan foydalanadi.
 *
 * @param {object} totals   monthlyTotal natijasi
 * @param {Array}  payouts  shu xodimga shu oyda berilgan to'lovlar
 */
export function payoutState(totals, payouts = []) {
  const berilgan = payouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const qoldi = totals.yakuniy - berilgan

  return {
    kerak: totals.yakuniy,
    berilgan,
    qoldi,
    // Kichik qoldiq (yaxlitlash farqi) "to'langan" deb hisoblanadi
    toliq: qoldi <= 0,
  }
}

/**
 * Lavozimlar kesimida kunlik yig'ma — Telegram hisoboti va
 * boshqaruv paneli shu funksiyadan foydalanadi.
 *
 * @returns {Array<{positionId, name, kelgan, kechikkan, jami}>}
 */
export function summarizeByPosition(workers = [], records = [], positions = []) {
  const byWorker = new Map(records.map((r) => [r.workerId, r]))
  const posById = new Map(positions.map((p) => [p.id, p]))
  const groups = new Map()

  for (const w of workers) {
    if (w.active === false) continue

    const key = w.positionId || 'boshqa'
    if (!groups.has(key)) {
      groups.set(key, {
        positionId: key,
        name: posById.get(key)?.name || 'Boshqa',
        icon: posById.get(key)?.icon || '👤',
        order: posById.get(key)?.order ?? 99,
        kelgan: 0,
        kechikkan: 0,
        jami: 0,
      })
    }

    const g = groups.get(key)
    g.jami += 1

    const rec = byWorker.get(w.id)
    if (rec && STATUS[rec.status]?.paid) {
      g.kelgan += 1
      if (rec.status === 'kech') g.kechikkan += 1
    }
  }

  return [...groups.values()].sort((a, b) => a.order - b.order)
}
