/**
 * VAQTINCHA TASHXIS MARSHRUTI
 * ═══════════════════════════
 * Har bir modulni alohida yuklab ko'radi va qaysi biri yiqilishini
 * xato matni bilan qaytaradi.
 *
 * Oddiy marshrutlarda importlar fayl boshida turadi — ular yiqilsa
 * xato try/catch ga tushmaydi va HTML 500 bo'lib chiqadi, sababi
 * ko'rinmaydi. Bu yerda importlar dinamik: har biri alohida
 * o'raladi va sabab o'qiladi.
 *
 * Muammo topilgach bu fayl o'chiriladi.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const natija = {}

  async function sina(nom, yukla) {
    try {
      await yukla()
      natija[nom] = 'OK'
    } catch (e) {
      natija[nom] = `XATO: ${e?.name || ''} ${e?.message || e}`.trim().slice(0, 300)
    }
  }

  await sina('server-only', () => import('server-only'))
  await sina('firebase-admin/app', () => import('firebase-admin/app'))
  await sina('firebase-admin/auth', () => import('firebase-admin/auth'))
  await sina('firebase-admin/firestore', () => import('firebase-admin/firestore'))
  await sina('lib/server/api', () => import('@/lib/server/api'))
  await sina('lib/server/telegram', () => import('@/lib/server/telegram'))
  await sina('lib/server/messages', () => import('@/lib/server/messages'))
  await sina('lib/server/firebase-admin', () => import('@/lib/server/firebase-admin'))

  // Modullar yuklangan bo'lsa, Admin SDK ni haqiqatda ishga tushirib ko'ramiz
  await sina('adminAuth() ishga tushirish', async () => {
    const { adminAuth } = await import('@/lib/server/firebase-admin')
    adminAuth()
  })

  return Response.json({ ok: true, node: process.version, natija })
}
