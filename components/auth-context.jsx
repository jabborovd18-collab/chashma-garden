'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * AUTENTIFIKATSIYA KONTEKSTI
 * ════════════════════════════════════════════════════════════════
 * Firebase Auth seansi va foydalanuvchi profilini (rol bilan)
 * butun panel bo'ylab tarqatadi.
 *
 * Muhim: rol Firestore'dagi users/{uid} hujjatida saqlanadi va
 * xavfsizlik qoidalari ham o'sha hujjatga qaraydi. Ya'ni bu yerdagi
 * tekshiruvlar faqat interfeysni boshqaradi — haqiqiy himoya
 * server tomonda, firestore.rules ichida.
 * ════════════════════════════════════════════════════════════════
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { getAuthClient, getDb, firebaseConfigMissing } from '@/firebase/config'
import { PAGE_ACCESS } from '@/lib/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState(null)

  useEffect(() => {
    const missing = firebaseConfigMissing()
    if (missing.length > 0) {
      setConfigError(missing)
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(getAuthClient(), async (fbUser) => {
      if (!fbUser) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(fbUser)

      try {
        const snap = await getDoc(doc(getDb(), 'users', fbUser.uid))
        setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      } catch {
        // Profil o'qilmasa (masalan qoidalar bloklasa) — rolsiz foydalanuvchi
        setProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const logout = useCallback(async () => {
    await signOut(getAuthClient())
    setUser(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const snap = await getDoc(doc(getDb(), 'users', user.uid))
    setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  }, [user])

  const role = profile?.active ? profile.role : null

  const value = {
    user,
    profile,
    role,
    loading,
    configError,
    logout,
    refreshProfile,
    /** Foydalanuvchi shu bo'limga kira oladimi? */
    can: (page) => !!role && (PAGE_ACCESS[page] || []).includes(role),
    isDirector: role === 'director',
    /** Oddiy xodim — nazorat paneliga emas, shaxsiy kabinetga kiradi */
    isWorker: role === 'worker',
    workerId: profile?.workerId || null,
    /**
     * Rolga mos boshlang'ich sahifa. Har bir rol o'zi kira oladigan
     * bo'limga tushishi kerak, aks holda kirishi bilan «Ruxsat yo'q»
     * ko'radi.
     */
    homePath: role === 'worker' ? '/kabinet' : role === 'kassir' ? '/kassa' : '/davomat',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth faqat <AuthProvider> ichida ishlatiladi')
  return ctx
}
