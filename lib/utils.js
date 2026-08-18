/**
 * ════════════════════════════════════════════════════════════════
 * SANA, VAQT VA FORMATLASH YORDAMCHILARI
 * ════════════════════════════════════════════════════════════════
 * Barcha sana/vaqt hisoblari Toshkent vaqtida bajariladi, chunki
 * server UTC da ishlaydi va foydalanuvchi brauzeri boshqa mintaqada
 * bo'lishi mumkin. Aks holda kechqurun belgilangan davomat ertangi
 * kunga tushib qolar edi.
 * ════════════════════════════════════════════════════════════════
 */

import { TZ, OYLAR } from './constants'

/* ─── Sana ────────────────────────────────────────────────────── */

/** Toshkent vaqtidagi sana kaliti: '2026-08-18' */
export function dateKey(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/** Toshkent vaqtidagi soat: '09:12' */
export function timeNow(d = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d)
}

/** '2026-08-18' → '18 Avgust 2026' */
export function formatDate(key) {
  if (!key) return '—'
  const [y, m, d] = key.split('-').map(Number)
  return `${d} ${OYLAR[m - 1]} ${y}`
}

/** '2026-08-18' → 'Seshanba' */
export function weekdayName(key) {
  if (!key) return ''
  const kunlar = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
  // Kalitni UTC yarim tunda o'qiymiz — mintaqa siljishi hafta kunini buzmasligi uchun
  return kunlar[new Date(`${key}T00:00:00Z`).getUTCDay()]
}

/** Oy kaliti: '2026-08' */
export function monthKey(d = new Date()) {
  return dateKey(d).slice(0, 7)
}

/** '2026-08' → 'Avgust 2026' */
export function formatMonth(key) {
  if (!key) return '—'
  const [y, m] = key.split('-').map(Number)
  return `${OYLAR[m - 1]} ${y}`
}

/** Oydagi barcha sana kalitlari: ['2026-08-01', ...] */
export function daysInMonth(mKey) {
  const [y, m] = mKey.split('-').map(Number)
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const out = []
  for (let d = 1; d <= count; d++) {
    out.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return out
}

/** Sana kalitini kun soniga siljitish: shiftDate('2026-08-18', -1) */
export function shiftDate(key, delta) {
  const d = new Date(`${key}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

/* ─── Vaqt ────────────────────────────────────────────────────── */

/** '09:30' → 570 (yarim tundan beri daqiqalar) */
export function hhmmToMinutes(hhmm) {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return null
  const [h, m] = hhmm.split(':').map(Number)
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

/** 570 → '09:30' */
export function minutesToHhmm(mins) {
  const m = ((mins % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** 95 → '1 soat 35 daq' */
export function formatDuration(mins) {
  if (!mins || mins <= 0) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} daq`
  if (m === 0) return `${h} soat`
  return `${h} soat ${m} daq`
}

/* ─── Pul ─────────────────────────────────────────────────────── */

/** 1250000 → '1 250 000' */
export function formatSom(n) {
  const v = Number(n) || 0
  return Math.round(v).toLocaleString('ru-RU').replace(/ /g, ' ')
}

/** 1250000 → '1 250 000 so'm' */
export function formatSomFull(n) {
  return `${formatSom(n)} so'm`
}

/** Foydalanuvchi kiritgan "1 250 000" yoki "1250000" ni songa aylantiradi */
export function parseSom(str) {
  const digits = String(str ?? '').replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

/* ─── Matn ────────────────────────────────────────────────────── */

/** 'Aziz Karimov' → 'AK' */
export function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}
