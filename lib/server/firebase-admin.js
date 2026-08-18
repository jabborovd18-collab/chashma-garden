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
 * Muhit o'zgaruvchisini tozalab oladi.
 *
 * Qiymatlar odatda JSON fayldan ko'chiriladi va tirnoq bilan birga
 * qolib ketadi. `.env` faylida dotenv tirnoqni o'zi olib tashlaydi,
 * lekin Vercel qiymatni **so'zma-so'z** saqlaydi — tirnoq ham qiymat
 * ichiga kiradi va `chashma-garden` o'rniga `"chashma-garden"` bo'lib
 * qoladi. Shuning uchun har bir server qiymatidan tirnoqni olib
 * tashlaymiz.
 */
function stripQuotes(s) {
  return s.replace(/^\s*["']|["']\s*$/g, '')
}

function envValue(name) {
  const raw = process.env[name]
  if (!raw) return ''
  return stripQuotes(raw).trim()
}

/**
 * Xizmat kaliti ko'p qatorli, muhit o'zgaruvchisi esa bir qatorli.
 * Shuning uchun qator ko'chirish `\n` ko'rinishida yoziladi — uni
 * haqiqiy qator ko'chirishga qaytaramiz. Kalit Vercel'ga haqiqiy
 * qator ko'chirishlar bilan qo'yilgan bo'lsa ham buzilmaydi.
 *
 * Oxirida `+ '\n'` turibdi va bu ataylab: PEM kalit qator ko'chirish
 * bilan tugashi kerak, `trim()` esa uni yeb qo'yadi. Turli ko'rinishda
 * kiritilgan kalit shu yerda bir xil holatga keltiriladi.
 */
function normalizePrivateKey(name) {
  const raw = process.env[name]
  if (!raw) return ''
  return stripQuotes(raw).replace(/\\n/g, '\n').trim() + '\n'
}

/** Sozlanmagan o'zgaruvchilar ro'yxati */
export function adminConfigMissing() {
  return ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'].filter(
    (name) => !envValue(name)
  )
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
        projectId: envValue('FIREBASE_PROJECT_ID'),
        clientEmail: envValue('FIREBASE_CLIENT_EMAIL'),
        privateKey: normalizePrivateKey('FIREBASE_PRIVATE_KEY'),
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
