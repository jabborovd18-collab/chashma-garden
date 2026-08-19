'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * UMUMIY UI KOMPONENTLARI
 * ════════════════════════════════════════════════════════════════
 * Dizayn qoidalari CLAUDE.md 1-bo'limida. Qisqacha:
 *   · emoji yo'q — barcha belgi <Icon /> orqali
 *   · radius: kartochka 10, boshqaruv 8, nishon 6
 *   · soya emas, chegara — soya faqat suzuvchi elementda
 *   · gradient yo'q
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { COLORS, UI } from '@/lib/constants'
import { initials } from '@/lib/utils'
import { Icon } from './icons'

/**
 * `position: fixed` element ekranga nisbatan joylashishi uchun uni
 * <body> ga ko'chiramiz.
 *
 * Sababi: `transform`, `filter` yoki `perspective` xossasi bor
 * har qanday ota-element o'z ichidagi fixed elementlar uchun yangi
 * mos yozuvlar nuqtasi yaratadi. Bizda sahifalar `.animate-fadeIn`
 * bilan o'ralgan, unda esa transform bor — natijada modal ekranga
 * emas, o'sha blokka nisbatan joylashib, tepasi kesilib qolgan edi.
 *
 * Portal bu bog'liqlikni butunlay uzadi: kelajakda qanday o'ram
 * qo'shilsa ham modal to'g'ri joylashadi.
 */
function usePortal() {
  const [target, setTarget] = useState(null)
  // Server tomonda document yo'q — brauzerga ulangandan keyin o'rnatamiz
  useEffect(() => setTarget(document.body), [])
  return target
}

/* ════════════════════════════════════════════════════════════════
   YUKLANISH
   ════════════════════════════════════════════════════════════════ */

export function Spinner({ size = 20, color = COLORS.primary }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid ${COLORS.border}`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

export function SectionLoading({ label = 'Yuklanmoqda' }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 20px' }}>
      <Spinner size={28} />
      <div style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 13 }}>{label}</div>
    </div>
  )
}

export function FullScreenLoading({ label = 'Yuklanmoqda' }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        background: COLORS.bg,
        color: COLORS.primary,
      }}
    >
      <Icon name="leaf" size={30} />
      <Spinner size={24} />
      <div style={{ color: COLORS.textMuted, fontSize: 13 }}>{label}</div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   XABARLAR
   ════════════════════════════════════════════════════════════════ */

const TOAST_STYLES = {
  success: { color: COLORS.success, icon: 'checkCircle' },
  error: { color: COLORS.danger, icon: 'alert' },
  info: { color: COLORS.info, icon: 'info' },
}

export function Toast({ message, type = 'success' }) {
  const t = TOAST_STYLES[type] || TOAST_STYLES.success
  const target = usePortal()

  if (!target) return null

  return createPortal(
    <div
      role="status"
      style={{
        position: 'fixed',
        top: 72,
        left: '50%',
        transform: 'translateX(-50%)',
        background: COLORS.text,
        color: COLORS.white,
        padding: '10px 16px',
        borderRadius: UI.radius.control,
        boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
        zIndex: 200,
        fontSize: 13.5,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        maxWidth: 'calc(100vw - 32px)',
        animation: 'toastSlide 0.25s ease',
      }}
    >
      <span style={{ color: type === 'error' ? '#FF9B96' : type === 'info' ? '#8FC3E8' : '#8FD49E' }}>
        <Icon name={t.icon} size={17} />
      </span>
      <span>{message}</span>
    </div>,
    target
  )
}

/** const { toast, showToast } = useToast() */
export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  return { toast, showToast }
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div
      style={{
        background: COLORS.dangerSoft,
        border: `1px solid ${COLORS.danger}26`,
        color: COLORS.danger,
        padding: '12px 14px',
        borderRadius: UI.radius.control,
        marginBottom: 16,
        fontSize: 13.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Icon name="alert" size={17} />
        {message}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            color: COLORS.danger,
            border: `1px solid ${COLORS.danger}40`,
            borderRadius: UI.radius.chip,
            fontSize: 12.5,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="refresh" size={14} />
          Qayta urinish
        </button>
      )}
    </div>
  )
}

export function InfoBanner({ children, tone = 'info', icon }) {
  const tones = {
    info: { color: COLORS.info, bg: COLORS.infoSoft, icon: 'info' },
    warning: { color: COLORS.warning, bg: COLORS.warningSoft, icon: 'alert' },
    neutral: { color: COLORS.textMuted, bg: COLORS.bg, icon: 'info' },
  }
  const t = tones[tone] || tones.info

  return (
    <div
      style={{
        background: t.bg,
        border: `1px solid ${t.color}20`,
        color: t.color,
        padding: '12px 14px',
        borderRadius: UI.radius.control,
        marginBottom: 16,
        fontSize: 13,
        lineHeight: 1.6,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <span style={{ marginTop: 1 }}>
        <Icon name={icon || t.icon} size={16} />
      </span>
      <div>{children}</div>
    </div>
  )
}

export function EmptyState({ icon = 'circleDashed', title, subtitle, action }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        padding: '52px 24px',
        borderRadius: UI.radius.card,
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', color: COLORS.textFaint }}>
        <Icon name={icon} size={34} strokeWidth={1.3} />
      </div>
      <h3 style={{ margin: '14px 0 0', fontSize: 15, color: COLORS.text, fontWeight: 600 }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ margin: '5px 0 0', fontSize: 13, color: COLORS.textMuted }}>{subtitle}</p>
      )}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MODAL
   ════════════════════════════════════════════════════════════════ */

export function Modal({ title, children, onClose, width = 560 }) {
  const target = usePortal()

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!target) return null

  return createPortal(
    <div
      onClick={onClose}
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,24,21,0.45)',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-panel"
        style={{
          background: COLORS.surface,
          width: '100%',
          maxWidth: width,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: COLORS.text }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Yopish"
            style={{
              background: 'transparent',
              border: 'none',
              width: 30,
              height: 30,
              borderRadius: UI.radius.chip,
              color: COLORS.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* minHeight: 0 shart. Usiz flex bolasining eng kichik balandligi
            o'z mazmuniga teng bo'lib qoladi, ya'ni bu blok qisqarmaydi.
            Natijada modal max-height dan oshib ketadi va markazlashgani
            uchun sarlavhasi ekran tepasidan chiqib ketadi. */}
        <div style={{ padding: 18, overflowY: 'auto', flex: 1, minHeight: 0 }}>{children}</div>
      </div>
    </div>,
    target
  )
}

export function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onCancel, busy }) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.6, margin: 0 }}>{message}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button onClick={onCancel} disabled={busy} style={secondaryButtonStyle({ flex: 1 })}>
          Bekor qilish
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          style={primaryButtonStyle({ flex: 1, background: confirmColor || COLORS.danger })}
        >
          {busy ? <Spinner size={15} color="#fff" /> : confirmLabel || 'Tasdiqlash'}
        </button>
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════════════════════════
   SARLAVHA VA FORMA
   ════════════════════════════════════════════════════════════════ */

export function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 18,
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        {icon && (
          <span style={{ color: COLORS.primary }}>
            <Icon name={icon} size={21} />
          </span>
        )}
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.text,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginTop: 2 }}>{subtitle}</div>
          )}
        </div>
      </div>
      {/* Telefonda boshqaruv tugmalari butun kenglikni egallaydi va
          o'rami bo'yicha yangi qatorga tushadi — globals.css dagi
          .header-actions qoidasiga qarang */}
      {action && <div className="header-actions">{action}</div>}
    </div>
  )
}

export function FormField({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12.5,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 5, lineHeight: 1.5 }}>
          {hint}
        </div>
      )}
    </div>
  )
}

/** Forma ichidagi xato xabari */
export function FormError({ message }) {
  if (!message) return null
  return (
    <div
      style={{
        background: COLORS.dangerSoft,
        color: COLORS.danger,
        padding: '10px 12px',
        borderRadius: UI.radius.control,
        fontSize: 12.5,
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Icon name="alert" size={15} />
      {message}
    </div>
  )
}

export function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={!!value}
      style={{
        width: 40,
        height: 23,
        background: value ? COLORS.primary : COLORS.borderStrong,
        border: 'none',
        borderRadius: 999,
        position: 'relative',
        transition: 'background 0.18s',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 17,
          height: 17,
          background: COLORS.white,
          borderRadius: '50%',
          position: 'absolute',
          top: 3,
          left: value ? 20 : 3,
          transition: 'left 0.18s',
        }}
      />
    </button>
  )
}

export function IconButton({ icon, onClick, title, color, disabled, size = 32 }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        background: 'transparent',
        border: `1px solid ${COLORS.border}`,
        borderRadius: UI.radius.chip,
        color: color || COLORS.textMuted,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={icon} size={size <= 28 ? 14 : 16} />
    </button>
  )
}

/** Filtr tugmalari qatori */
export function FilterChips({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              padding: '7px 13px',
              borderRadius: UI.radius.chip,
              border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
              background: active ? COLORS.primary : COLORS.surface,
              color: active ? COLORS.white : COLORS.textMuted,
              fontSize: 12.5,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {o.label}
            {o.count != null && (
              <span style={{ opacity: 0.65, fontWeight: 500 }}>{o.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   KO'RSATKICHLAR
   ════════════════════════════════════════════════════════════════ */

/**
 * Ko'rsatkich kartochkasi.
 * Rang faqat `tone` berilganda qo'llanadi — odatiy holda raqam
 * qora, ikona kulrang. Har bir kartochka rangli bo'lsa, hech biri
 * ajralib turmaydi.
 */
export function StatCard({ icon, label, value, sub, tone }) {
  const toneColor = {
    danger: COLORS.danger,
    warning: COLORS.warning,
    success: COLORS.success,
    info: COLORS.info,
  }[tone]

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: UI.radius.card,
        padding: 14,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          color: COLORS.textMuted,
          marginBottom: 10,
        }}
      >
        <Icon name={icon} size={15} />
        <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.01em' }}>{label}</span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: toneColor || COLORS.text,
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  )
}

export function StatGrid({ children, min = 150 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        gap: 10,
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  )
}

export function Badge({ children, icon, color = COLORS.textMuted }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: UI.radius.chip,
        fontSize: 11.5,
        fontWeight: 600,
        background: color + '14',
        color,
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
      }}
    >
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  )
}

export function Avatar({ name, size = 34, color = COLORS.textMuted }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: UI.radius.control,
        background: color + '14',
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 600,
        flexShrink: 0,
        letterSpacing: '0.02em',
      }}
    >
      {initials(name)}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   USLUB YORDAMCHILARI
   ════════════════════════════════════════════════════════════════ */

export function inputStyle(extra = {}) {
  return {
    width: '100%',
    padding: '9px 12px',
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: UI.radius.control,
    fontSize: 13.5,
    color: COLORS.text,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: UI.control.height,
    ...extra,
  }
}

export function primaryButtonStyle(extra = {}) {
  return {
    padding: '0 16px',
    background: COLORS.primary,
    color: COLORS.white,
    border: '1px solid transparent',
    borderRadius: UI.radius.control,
    fontSize: 13.5,
    fontWeight: 600,
    minHeight: UI.control.height,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    whiteSpace: 'nowrap',
    ...extra,
  }
}

export function secondaryButtonStyle(extra = {}) {
  return {
    padding: '0 14px',
    background: COLORS.surface,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: UI.radius.control,
    fontSize: 13.5,
    fontWeight: 600,
    minHeight: UI.control.height,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    whiteSpace: 'nowrap',
    ...extra,
  }
}

export function cardStyle(extra = {}) {
  return {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: UI.radius.card,
    ...extra,
  }
}
