'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * KIRISH SAHIFASI
 * ════════════════════════════════════════════════════════════════
 * Firebase Auth orqali email/parol bilan kirish.
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getAuthClient } from '@/firebase/config'
import { useAuth } from '@/components/auth-context'
import { COLORS, UI } from '@/lib/constants'
import { loginToEmail, normalizeSignIn } from '@/lib/username'
import { authErrorMessage } from '@/lib/auth-errors'
import { Icon } from '@/components/icons'
import {
  Spinner,
  FullScreenLoading,
  FormError,
  inputStyle,
  primaryButtonStyle,
} from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const { user, role, loading: authLoading, configError, homePath } = useAuth()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Rol aniqlangach o'z sahifasiga yuboramiz:
  // xodim → shaxsiy kabinet, qolganlar → nazorat paneli
  useEffect(() => {
    if (!authLoading && user && role) router.replace(homePath)
  }, [authLoading, user, role, homePath, router])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!login.trim() || !password) {
      setError('Login va parolni kiriting')
      return
    }

    setBusy(true)
    try {
      await signInWithEmailAndPassword(getAuthClient(), loginToEmail(login), password)
      // Yo'naltirishni yuqoridagi useEffect bajaradi — rol o'qilgach
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  if (authLoading) return <FullScreenLoading />

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: COLORS.bg,
      }}
    >
      <div style={{ width: '100%', maxWidth: 368 }}>
        <div
          style={{
            textAlign: 'center',
            marginBottom: 26,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ color: COLORS.primary }}>
            <Icon name="leaf" size={30} strokeWidth={1.5} />
          </span>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: COLORS.text }}>Chashma Garden</h1>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 3 }}>
              Davomat va oylik nazorat paneli
            </p>
          </div>
        </div>

        {configError ? (
          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: UI.radius.card,
              padding: 20,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                color: COLORS.danger,
                fontWeight: 600,
              }}
            >
              <Icon name="alert" size={17} />
              Firebase sozlanmagan
            </div>
            <p style={{ marginTop: 10, color: COLORS.textMuted }}>
              Loyiha ildizida <code>.env.local</code> fayl yarating va quyidagilarni to‘ldiring:
            </p>
            <ul
              style={{
                marginTop: 8,
                paddingLeft: 18,
                color: COLORS.textMuted,
                fontSize: 11.5,
                fontFamily: 'monospace',
              }}
            >
              {configError.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: UI.radius.card,
              padding: 22,
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Login</label>
              <input
                value={login}
                onChange={(e) => setLogin(normalizeSignIn(e.target.value))}
                placeholder="aziz.karimov"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                style={inputStyle()}
              />
              {/* Tizim username'ga o'tishdan oldin ochilgan hisoblar
                  email bilan kiradi — shuni eslatib turamiz */}
              <div style={{ fontSize: 11, color: COLORS.textFaint, marginTop: 5 }}>
                Eski hisob bo‘lsa to‘liq emailingizni yozing
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Parol</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={inputStyle({ paddingRight: 42 })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: 4,
                    width: 30,
                    height: 30,
                    border: 'none',
                    background: 'transparent',
                    color: COLORS.textFaint,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: UI.radius.chip,
                  }}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
            </div>

            <FormError message={error} />

            <button
              type="submit"
              disabled={busy}
              className="btn-primary"
              style={primaryButtonStyle({ width: '100%' })}
            >
              {busy ? <Spinner size={16} color="#fff" /> : 'Kirish'}
            </button>
          </form>
        )}

        <p
          style={{
            fontSize: 11.5,
            color: COLORS.textFaint,
            textAlign: 'center',
            marginTop: 18,
            lineHeight: 1.6,
          }}
        >
          Hisobingiz yo‘q bo‘lsa direktorga murojaat qiling.
          <br />
          Tizim birinchi marta ishga tushirilayotgan bo‘lsa —{' '}
          <Link href="/sozlash" style={{ color: COLORS.primary, fontWeight: 600 }}>
            dastlabki sozlash
          </Link>
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: COLORS.text,
  marginBottom: 6,
}
