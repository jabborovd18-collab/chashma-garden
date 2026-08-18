import 'server-only'

/**
 * ════════════════════════════════════════════════════════════════
 * FIREBASE ADMIN SDK — FAQAT SERVER TOMONIDA
 * ════════════════════════════════════════════════════════════════
 * Admin SDK xavfsizlik qoidalarini butunlay chetlab o'tadi — u
 * bazadagi hamma narsani o'qiy va o'zgartira oladi. Shuning uchun
 * xizmat kaliti (service account) hech qachon brauzerga tushmasligi
 * kerak.
 *
 * `import 'server-only'` yuqorida turibdi: agar kimdir bu faylni
 * xato bilan mijoz komponentidan import qilsa, loyiha YIG'ILMAYDI.
 * Bu shunchaki eslatma emas — haqiqiy to'siq.
 *
 * Shu sababli muhit o'zgaruvchilarida `NEXT_PUBLIC_` prefiksi YO'Q.
 *
 * Kerakli o'zgaruvchilar (.env.local va Vercel'da):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 * ════════════════════════════════════════════════════════════════
 */

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const APP_NAME = 'chashma-admin'

/**
 * Vercel muhit o'zgaruvchilarida ko'p qatorli matn saqlanmaydi,
 * shuning uchun kalit ichidagi qator ko'chirish `\n` ko'rinishida
 * yoziladi. Uni haqiqiy qator ko'chirishga qaytaramiz.
 */
function normalizePrivateKey(raw) {
  if (!raw) return ''
  // Ba'zan qiymat tirnoq ichida ko'chiriladi — ularni olib tashlaymiz
  const unquoted = raw.replace(/^["']|["']$/g, '')
  return unquoted.replace(/\\n/g, '\n')
}

/** Sozlanmagan o'zgaruvchilar ro'yxati */
export function adminConfigMissing() {
  const kerak = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  }
  return Object.entries(kerak)
    .filter(([, v]) => !v)
    .map(([k]) => k)
}

function ensureApp() {
  const mavjud = getApps().find((a) => a.name === APP_NAME)
  if (mavjud) return mavjud

  const missing = adminConfigMissing()
  if (missing.length > 0) {
    throw new Error(`Server sozlamalari to'liq emas: ${missing.join(', ')}`)
  }

  return initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    },
    APP_NAME
  )
}

export function adminDb() {
  return getFirestore(ensureApp())
}

export function adminAuth() {
  return getAuth(ensureApp())
}

/**
 * So'rovni yuborgan foydalanuvchini aniqlaydi va rolini qaytaradi.
 *
 * Mijoz `Authorization: Bearer <idToken>` sarlavhasini yuboradi.
 * Token Firebase tomonidan imzolangan — uni soxtalashtirib bo'lmaydi.
 * Roli esa `users/{uid}` hujjatidan olinadi, mijoz aytganidan emas.
 *
 * @returns {{uid: string, role: string, name: string}}
 * @throws  ruxsat bo'lmasa
 */
export async function requireUser(request, ruxsatEtilganRollar = null) {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

  if (!token) {
    const e = new Error('Avtorizatsiya tokeni yuborilmadi')
    e.status = 401
    throw e
  }

  let decoded
  try {
    decoded = await adminAuth().verifyIdToken(token)
  } catch {
    const e = new Error('Token yaroqsiz yoki muddati o‘tgan')
    e.status = 401
    throw e
  }

  const snap = await adminDb().collection('users').doc(decoded.uid).get()
  const profile = snap.exists ? snap.data() : null

  if (!profile || profile.active !== true) {
    const e = new Error('Hisobingiz faol emas')
    e.status = 403
    throw e
  }

  if (ruxsatEtilganRollar && !ruxsatEtilganRollar.includes(profile.role)) {
    const e = new Error('Bu amal uchun ruxsatingiz yo‘q')
    e.status = 403
    throw e
  }

  return { uid: decoded.uid, role: profile.role, name: profile.name || '' }
}
