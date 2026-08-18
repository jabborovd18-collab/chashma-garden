'use client'

/**
 * Bosh sahifa — faqat yo'naltirgich.
 * Har bir rol o'zi kira oladigan bo'limga tushadi:
 *   xodim  → /kabinet
 *   kassir → /kassa
 *   qolgan → /davomat
 * Kirmagan bo'lsa → /login
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-context'
import { FullScreenLoading } from '@/components/ui'

export default function Home() {
  const router = useRouter()
  const { user, role, loading, configError, homePath } = useAuth()

  useEffect(() => {
    if (loading) return
    if (configError || !user) router.replace('/login')
    else if (role) router.replace(homePath)
    else router.replace('/login')
  }, [loading, configError, user, role, homePath, router])

  return <FullScreenLoading />
}
