import 'server-only'

/**
 * API marshrutlari uchun kichik yordamchilar.
 * Barcha javoblar bir xil ko'rinishda bo'lishi uchun.
 */

export function ok(data = {}) {
  return Response.json({ ok: true, ...data })
}

export function fail(error, status = 400) {
  const xabar = typeof error === 'string' ? error : error?.message || 'Xatolik'
  return Response.json({ ok: false, error: xabar }, { status: error?.status || status })
}

/**
 * Cron so'rovini tekshiradi.
 *
 * Ikki usulni ham qabul qiladi:
 *   · Vercel Cron  → Authorization: Bearer <CRON_SECRET>
 *   · tashqi xizmat → ?secret=<CRON_SECRET>
 *
 * Vercel Hobby tarifida cron kuniga bir marta ishlaydi, bizga esa
 * ikki marta kerak — shuning uchun tashqi xizmat (cron-job.org)
 * ham qo'llab-quvvatlanadi.
 */
export function cronAuthorized(request) {
  const kutilgan = process.env.CRON_SECRET
  if (!kutilgan) return false

  const header = request.headers.get('authorization') || ''
  if (header === `Bearer ${kutilgan}`) return true

  const url = new URL(request.url)
  return url.searchParams.get('secret') === kutilgan
}
