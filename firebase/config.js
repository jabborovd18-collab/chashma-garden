/**
 * ════════════════════════════════════════════════════════════════
 * FIREBASE - MIJOZ TOMONI SOZLAMALARI
 * ════════════════════════════════════════════════════════════════
 * Firebase "dangasa" (lazy) ishga tushiriladi: modul import qilinganda
 * emas, balki birinchi marta ishlatilganda. Shu sababli .env.local
 * to'ldirilmagan bo'lsa ham `next build` va SSR ishlayveradi —
 * xatolik faqat brauzerda, tushunarli xabar bilan chiqadi.
 * ════════════════════════════════════════════════════════════════
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/** Firebase kaliti → .env.local dagi o'zgaruvchi nomi */
const ENV_NAMES = {
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
}

/**
 * To'ldirilmagan sozlamalar ro'yxati — .env.local dagi nomlar bilan,
 * shunda foydalanuvchi aynan nimani yozish kerakligini ko'radi.
 */
export function firebaseConfigMissing() {
  return Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => ENV_NAMES[key] || key)
}

function ensureApp() {
  if (getApps().length) return getApp()

  const missing = firebaseConfigMissing()
  if (missing.length > 0) {
    throw new Error(
      `Firebase sozlamalari to'liq emas. .env.local faylida quyidagilarni to'ldiring: ${missing.join(', ')}`
    )
  }

  return initializeApp(firebaseConfig)
}

export function getDb() {
  return getFirestore(ensureApp())
}

export function getAuthClient() {
  return getAuth(ensureApp())
}

/**
 * Yangi foydalanuvchi yaratish uchun ikkinchi Firebase ilovasi.
 * Oddiy `createUserWithEmailAndPassword` chaqirilsa, joriy admin
 * seansdan chiqib, yangi foydalanuvchi sifatida kirib qoladi.
 * Alohida ilova nusxasi bu muammoni oldini oladi.
 */
export function getSecondaryAuth() {
  const name = 'user-creator'
  const existing = getApps().find((a) => a.name === name)
  const app = existing || initializeApp(firebaseConfig, name)
  return getAuth(app)
}
