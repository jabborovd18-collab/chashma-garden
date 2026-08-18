'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * XODIMGA KIRISH HUQUQI BERISH
 * ════════════════════════════════════════════════════════════════
 * Direktor xodimga login va parol beradi — xodim shu bilan
 * shaxsiy kabinetiga kiradi.
 *
 * Hisob ikkilamchi Firebase ilovasi orqali yaratiladi. Oddiy
 * `createUserWithEmailAndPassword` chaqirilsa, Firebase joriy
 * seansni yangi hisobga almashtiradi — ya'ni direktor o'z
 * panelidan chiqib, xodim sifatida kirib qolardi.
 *
 * ─── Parolni tiklash haqida ───
 * Boshqa foydalanuvchining parolini brauzerdan o'zgartirib
 * bo'lmaydi — buning uchun server tomonida Firebase Admin SDK
 * kerak. Shu sababli:
 *   · xodim o'z parolini kabinetdan o'zgartira oladi
 *   · parolni unutgan bo'lsa — Telegram bosqichida qo'shiladigan
 *     Admin SDK orqali tiklanadi
 * Vaqtinchalik yechim: kirishni to'xtatib, yangi login berish.
 * ════════════════════════════════════════════════════════════════
 */

import {
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { getSecondaryAuth, getDb, getAuthClient } from '@/firebase/config'
import { loginToEmail } from './username'

/**
 * Xodimga login yaratadi: Firebase hisobi + users hujjati +
 * workers hujjatidagi bog'lanish — bitta tranzaksiyada.
 */
export async function createWorkerLogin({ workerId, workerName, login, password }) {
  const db = getDb()
  const secondary = getSecondaryAuth()

  const cred = await createUserWithEmailAndPassword(secondary, loginToEmail(login), password)
  const uid = cred.user.uid

  try {
    const batch = writeBatch(db)

    batch.set(doc(db, 'users', uid), {
      name: workerName,
      username: login,
      role: 'worker',
      workerId,
      active: true,
      createdAt: serverTimestamp(),
    })

    batch.update(doc(db, 'workers', workerId), {
      username: login,
      authUid: uid,
      updatedAt: serverTimestamp(),
    })

    await batch.commit()
  } finally {
    // Ikkilamchi seansni har qanday holatda yopamiz
    await signOut(secondary).catch(() => {})
  }

  return uid
}

/**
 * Kirishni to'xtatish yoki tiklash.
 *
 * Hisob O'CHIRILMAYDI, faqat `active` bayrog'i o'zgaradi. Sababi:
 * Firebase hisobini brauzerdan o'chirib bo'lmaydi, o'chirilgandek
 * qilib users hujjatini yo'q qilsak esa login abadiy band bo'lib
 * qoladi va o'sha xodimga qayta berib bo'lmaydi.
 *
 * `active: false` bo'lganda xavfsizlik qoidalari xodimga hech
 * qanday ma'lumot bermaydi — kirish haqiqatan ham yopiladi.
 */
export async function setWorkerLoginActive(authUid, active) {
  const db = getDb()
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', authUid), { active, updatedAt: serverTimestamp() })
  await batch.commit()
}

/**
 * Foydalanuvchi o'z parolini o'zgartiradi.
 * Firebase yaqinda kirilgan bo'lishini talab qiladi, shuning uchun
 * avval joriy parol bilan qayta tasdiqlaymiz.
 */
export async function changeOwnPassword(currentPassword, newPassword) {
  const auth = getAuthClient()
  const user = auth.currentUser
  if (!user) throw new Error('Seans topilmadi. Qaytadan kiring.')

  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}
