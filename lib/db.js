'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * FIRESTORE MUROJAATLARI
 * ════════════════════════════════════════════════════════════════
 * Barcha baza so'rovlari shu yerda jamlangan — sahifalar Firestore
 * API sini bevosita chaqirmaydi. Shu sababli kolleksiya nomi yoki
 * so'rov mantiqi o'zgarsa, faqat shu fayl tahrirlanadi.
 * ════════════════════════════════════════════════════════════════
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { getDb } from '@/firebase/config'
import { DEFAULT_SETTINGS } from './constants'

/* ─── Sozlamalar ──────────────────────────────────────────────── */

export async function loadSettings() {
  const snap = await getDoc(doc(getDb(), 'settings', 'app'))
  return snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : { ...DEFAULT_SETTINGS }
}

export async function saveSettings(data) {
  await setDoc(doc(getDb(), 'settings', 'app'), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

/* ─── Lavozimlar ──────────────────────────────────────────────── */

export async function loadPositions() {
  const snap = await getDocs(query(collection(getDb(), 'positions'), orderBy('order', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createPosition(data) {
  await addDoc(collection(getDb(), 'positions'), { ...data, createdAt: serverTimestamp() })
}

export async function updatePosition(id, data) {
  await updateDoc(doc(getDb(), 'positions', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deletePosition(id) {
  await deleteDoc(doc(getDb(), 'positions', id))
}

/* ─── Xodimlar ────────────────────────────────────────────────── */

export async function loadWorkers() {
  const snap = await getDocs(query(collection(getDb(), 'workers'), orderBy('name', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** @returns {string} yaratilgan xodimning id si — login biriktirish uchun kerak */
export async function createWorker(data) {
  const ref = await addDoc(collection(getDb(), 'workers'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateWorker(id, data) {
  await updateDoc(doc(getDb(), 'workers', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteWorker(id) {
  await deleteDoc(doc(getDb(), 'workers', id))
}

/* ─── Davomat ─────────────────────────────────────────────────── */
//
// Hujjat id si `${sana}_${xodimId}` ko'rinishida — bir kunga bir
// xodim uchun ikkita yozuv paydo bo'lishi mumkin emas. Ikki kishi
// bir vaqtda belgilasa ham natija bitta bo'ladi.

export function attendanceId(dateKey, workerId) {
  return `${dateKey}_${workerId}`
}

export async function loadAttendanceByDate(dateKey) {
  const snap = await getDocs(query(collection(getDb(), 'attendance'), where('date', '==', dateKey)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** Oy bo'yicha: '2026-08' → shu oyning barcha yozuvlari */
export async function loadAttendanceByMonth(mKey) {
  const snap = await getDocs(
    query(
      collection(getDb(), 'attendance'),
      where('date', '>=', `${mKey}-01`),
      where('date', '<=', `${mKey}-31`)
    )
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function saveAttendance(dateKey, workerId, data) {
  await setDoc(
    doc(getDb(), 'attendance', attendanceId(dateKey, workerId)),
    { date: dateKey, workerId, ...data, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

export async function removeAttendance(dateKey, workerId) {
  await deleteDoc(doc(getDb(), 'attendance', attendanceId(dateKey, workerId)))
}

/* ─── Avanslar ────────────────────────────────────────────────── */

export async function loadAdvancesByMonth(mKey) {
  const snap = await getDocs(
    query(
      collection(getDb(), 'advances'),
      where('date', '>=', `${mKey}-01`),
      where('date', '<=', `${mKey}-31`)
    )
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createAdvance(data) {
  await addDoc(collection(getDb(), 'advances'), { ...data, createdAt: serverTimestamp() })
}

export async function deleteAdvance(id) {
  await deleteDoc(doc(getDb(), 'advances', id))
}

/* ─── Ushlanmalar (xodim zimmasiga yozilgan summa) ────────────── */
//
// Singan idish, yo'qolgan jihoz, kam chiqqan kassa — kassir shu
// yerga yozadi va summa oylikdan ushlab qolinadi. Jarimadan farqi:
// jarima davomatdan avtomatik chiqadi, ushlanma esa qo'lda yoziladi.

export async function loadChargesByMonth(mKey) {
  const snap = await getDocs(
    query(
      collection(getDb(), 'charges'),
      where('date', '>=', `${mKey}-01`),
      where('date', '<=', `${mKey}-31`)
    )
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createCharge(data) {
  await addDoc(collection(getDb(), 'charges'), { ...data, createdAt: serverTimestamp() })
}

export async function deleteCharge(id) {
  await deleteDoc(doc(getDb(), 'charges', id))
}

/* ─── To'lovlar (kassir bergan pul) ───────────────────────────── */

export async function loadPayoutsByMonth(mKey) {
  const snap = await getDocs(query(collection(getDb(), 'payouts'), where('month', '==', mKey)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createPayout(data) {
  await addDoc(collection(getDb(), 'payouts'), { ...data, createdAt: serverTimestamp() })
}

export async function deletePayout(id) {
  await deleteDoc(doc(getDb(), 'payouts', id))
}

/* ─── Xodimning shaxsiy kabineti uchun so'rovlar ──────────────── */
//
// Diqqat: bu so'rovlarda faqat BITTA tenglik sharti (`workerId`)
// ishlatiladi. Agar shartga sana oralig'i ham qo'shilsa, Firestore
// qo'shma indeks (composite index) talab qiladi va uni alohida
// yaratish kerak bo'ladi. Bitta xodimning yozuvlari yiliga ~365 ta —
// hammasini olib, saralashni brauzerda qilgan arzonroq va soddaroq.

export async function loadWorkerById(workerId) {
  const snap = await getDoc(doc(getDb(), 'workers', workerId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function loadMyAttendance(workerId) {
  const snap = await getDocs(
    query(collection(getDb(), 'attendance'), where('workerId', '==', workerId))
  )
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function loadMyAdvances(workerId) {
  const snap = await getDocs(
    query(collection(getDb(), 'advances'), where('workerId', '==', workerId))
  )
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export async function loadMyCharges(workerId) {
  const snap = await getDocs(
    query(collection(getDb(), 'charges'), where('workerId', '==', workerId))
  )
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export async function loadMyPayouts(workerId) {
  const snap = await getDocs(
    query(collection(getDb(), 'payouts'), where('workerId', '==', workerId))
  )
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

/* ─── Eslatmalar ──────────────────────────────────────────────── */

export async function loadNotes(workerId) {
  const snap = await getDocs(query(collection(getDb(), 'notes'), where('workerId', '==', workerId)))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export async function createNote(data) {
  await addDoc(collection(getDb(), 'notes'), { ...data, createdAt: serverTimestamp() })
}

export async function deleteNote(id) {
  await deleteDoc(doc(getDb(), 'notes', id))
}

/* ─── Shikoyatlar ─────────────────────────────────────────────── */

export async function loadComplaints(limitToStatus = null) {
  const base = collection(getDb(), 'complaints')
  const q = limitToStatus
    ? query(base, where('status', '==', limitToStatus), orderBy('date', 'desc'))
    : query(base, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createComplaint(data) {
  const ref = await addDoc(collection(getDb(), 'complaints'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateComplaint(id, data) {
  await updateDoc(doc(getDb(), 'complaints', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteComplaint(id) {
  await deleteDoc(doc(getDb(), 'complaints', id))
}

/* ─── Foydalanuvchilar (panelga kirish huquqi) ────────────────── */

export async function loadUsers() {
  const snap = await getDocs(collection(getDb(), 'users'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Faqat `worker` rolidagi profillar.
 *
 * Administrator butun `users` kolleksiyasini o‘qiy olmaydi (u yerda
 * direktor va hostes profillari ham bor). Xavfsizlik qoidasi unga
 * faqat worker hujjatlarini ochadi, shuning uchun so‘rov aynan shu
 * shart bilan cheklangan bo‘lishi shart — aks holda Firestore butun
 * so‘rovni rad etadi.
 */
export async function loadWorkerUsers() {
  const snap = await getDocs(query(collection(getDb(), 'users'), where('role', '==', 'worker')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createUserProfile(uid, data) {
  await setDoc(doc(getDb(), 'users', uid), { ...data, createdAt: serverTimestamp() })
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(getDb(), 'users', uid), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteUserProfile(uid) {
  await deleteDoc(doc(getDb(), 'users', uid))
}
