'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * TELEGRAM API MARSHRUTLARIGA MUROJAAT
 * ════════════════════════════════════════════════════════════════
 * Bot tokeni serverda, shuning uchun brauzer to'g'ridan-to'g'ri
 * Telegram'ga murojaat qilmaydi — o'z serverimizga so'rov yuboradi.
 *
 * Har bir so'rovga Firebase ID tokeni qo'shiladi: server so'rovni
 * kim yuborganini va uning rolini shu orqali tekshiradi.
 *
 * Muhim: bu funksiyalar HECH QACHON xato tashlamaydi. Telegram
 * ishlamay qolsa ham davomat belgilash yoki shikoyat saqlash
 * to'xtab qolmasligi kerak — bot qo'shimcha imkoniyat, asosiy
 * vazifa emas.
 * ════════════════════════════════════════════════════════════════
 */

import { getAuthClient } from '@/firebase/config'

async function murojaat(path, { method = 'POST', body = null } = {}) {
  try {
    const user = getAuthClient().currentUser
    if (!user) return { ok: false, error: 'Seans topilmadi' }

    const token = await user.getIdToken()

    const res = await fetch(path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    return await res.json()
  } catch (err) {
    return { ok: false, error: err?.message || 'Serverga ulanib bo‘lmadi' }
  }
}

/* ─── Avtomatik xabarlar ─────────────────────────────────────── */

/** Shikoyat guruhiga yuborish */
export function notifyComplaint(complaintId) {
  return murojaat('/api/telegram/shikoyat', { body: { complaintId } })
}

/** Xodim kelgani haqida davomat guruhiga yuborish */
export function notifyArrival(attendanceId) {
  return murojaat('/api/telegram/davomat', { body: { attendanceId } })
}

/* ─── Sozlamalar sahifasi uchun ──────────────────────────────── */

export function botStatus() {
  return murojaat('/api/telegram/holat', { method: 'GET' })
}

export function botGroups() {
  return murojaat('/api/telegram/guruhlar', { method: 'GET' })
}

export function botTest(chatId, guruhNomi) {
  return murojaat('/api/telegram/sinov', { body: { chatId, guruhNomi } })
}

export function sendReportNow() {
  return murojaat('/api/telegram/hisobot', { body: {} })
}
