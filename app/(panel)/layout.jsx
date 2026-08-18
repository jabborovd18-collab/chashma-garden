'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * PANEL KARKASI — HIMOYA VA NAVIGATSIYA
 * ════════════════════════════════════════════════════════════════
 * Bu layout ostidagi barcha sahifalar faqat tizimga kirgan va
 * faol roli bor foydalanuvchiga ochiladi. Har bir bo'lim uchun
 * ruxsat PAGE_ACCESS jadvalidan tekshiriladi.
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth-context'
import { COLORS, ROLES, PAGE_ACCESS, UI } from '@/lib/constants'
import { Icon } from '@/components/icons'
import { FullScreenLoading, Avatar, primaryButtonStyle } from '@/components/ui'

const NAV = [
  { id: 'davomat', href: '/davomat', label: 'Davomat', icon: 'attendance' },
  { id: 'ishchilar', href: '/ishchilar', label: 'Xodimlar', icon: 'users' },
  { id: 'shikoyatlar', href: '/shikoyatlar', label: 'Shikoyatlar', icon: 'megaphone' },
  { id: 'kassa', href: '/kassa', label: 'Kassa', icon: 'banknote' },
  { id: 'hisobot', href: '/hisobot', label: 'Oylik', icon: 'wallet' },
  { id: 'sozlamalar', href: '/sozlamalar', label: 'Sozlamalar', icon: 'settings' },
]

export default function PanelLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, role, loading, configError, logout, isWorker } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!loading && !configError && !user) router.replace('/login')
  }, [loading, configError, user, router])

  // Oddiy xodim nazorat paneliga kirmaydi — shaxsiy kabinetiga
  useEffect(() => {
    if (isWorker) router.replace('/kabinet')
  }, [isWorker, router])

  // Foydalanuvchi menyusini tashqariga bosilganda yopamiz
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  if (loading) return <FullScreenLoading />

  if (configError) {
    return (
      <Notice
        icon="settings"
        title="Firebase sozlanmagan"
        text={`.env.local faylida quyidagilar to'ldirilmagan: ${configError.join(', ')}`}
      />
    )
  }

  if (!user) return <FullScreenLoading label="Kirish sahifasiga o‘tilmoqda" />

  if (!profile) {
    return (
      <Notice
        icon="lock"
        title="Hisobingiz faollashtirilmagan"
        text="Sizning hisobingiz tizimda ro'yxatdan o'tkazilmagan. Direktorga murojaat qiling."
        onLogout={logout}
      />
    )
  }

  if (!profile.active) {
    return (
      <Notice
        icon="lock"
        title="Hisobingiz to‘xtatilgan"
        text="Direktor sizning kirish huquqingizni vaqtincha o'chirib qo'ygan."
        onLogout={logout}
      />
    )
  }

  if (isWorker) return <FullScreenLoading label="Kabinetga o‘tilmoqda" />

  const current = NAV.find((n) => pathname.startsWith(n.href))
  const allowed = current ? (PAGE_ACCESS[current.id] || []).includes(role) : true
  const visibleNav = NAV.filter((n) => (PAGE_ACCESS[n.id] || []).includes(role))
  const roleInfo = ROLES[role] || { label: role, icon: 'user' }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      <header
        className="no-print"
        style={{
          background: COLORS.primaryDark,
          color: COLORS.white,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* ─── Yuqori qator ─── */}
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '0 16px',
            height: 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <Icon name="leaf" size={19} />
            <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em' }}>
              Chashma Garden
            </span>
            <span
              style={{
                fontSize: 11,
                opacity: 0.6,
                paddingLeft: 9,
                marginLeft: 3,
                borderLeft: '1px solid rgba(255,255,255,0.25)',
              }}
              className="hide-sm"
            >
              Nazorat paneli
            </span>
          </div>

          {/* ─── Foydalanuvchi ─── */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                color: COLORS.white,
                padding: '4px 6px',
                borderRadius: UI.radius.chip,
              }}
            >
              <Avatar name={profile.name} size={28} color="#FFFFFF" />
              <span style={{ fontSize: 13, fontWeight: 500 }} className="hide-sm">
                {profile.name}
              </span>
              <span style={{ opacity: 0.7 }}>
                <Icon name="chevronRight" size={13} style={{ transform: 'rotate(90deg)' }} />
              </span>
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: UI.radius.card,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
                  minWidth: 210,
                  overflow: 'hidden',
                  color: COLORS.text,
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{profile.name}</div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: COLORS.textMuted,
                      marginTop: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Icon name={roleInfo.icon} size={12} />
                    {roleInfo.label}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textFaint, marginTop: 3 }}>
                    {profile.username || profile.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: 13.5,
                    color: COLORS.danger,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                  }}
                  className="btn-secondary"
                >
                  <Icon name="power" size={15} />
                  Chiqish
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Bo'limlar ─── */}
        <nav
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            padding: '0 16px',
            maxWidth: 1180,
            margin: '0 auto',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {visibleNav.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                style={{
                  padding: '10px 12px',
                  color: COLORS.white,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  whiteSpace: 'nowrap',
                  opacity: active ? 1 : 0.62,
                  boxShadow: active ? `inset 0 -2px 0 ${COLORS.white}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 16px 64px' }}>
        {allowed ? (
          children
        ) : (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: COLORS.textFaint }}>
              <Icon name="lock" size={32} strokeWidth={1.3} />
            </div>
            <h2 style={{ fontSize: 17, color: COLORS.text, marginTop: 14 }}>Ruxsat yo‘q</h2>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 6 }}>
              «{current?.label}» bo‘limi {roleInfo.label} roli uchun ochiq emas.
            </p>
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 560px) { .hide-sm { display: none !important; } }
      `}</style>
    </div>
  )
}

function Notice({ icon, title, text, onLogout }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: COLORS.bg,
      }}
    >
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: UI.radius.card,
          padding: 28,
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', color: COLORS.textFaint }}>
          <Icon name={icon} size={30} strokeWidth={1.3} />
        </div>
        <h2 style={{ fontSize: 16.5, color: COLORS.text, marginTop: 14 }}>{title}</h2>
        <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8, lineHeight: 1.6 }}>
          {text}
        </p>
        {onLogout && (
          <button onClick={onLogout} style={primaryButtonStyle({ marginTop: 20, width: '100%' })}>
            Chiqish
          </button>
        )}
      </div>
    </div>
  )
}
