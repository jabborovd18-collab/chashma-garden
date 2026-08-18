/**
 * ════════════════════════════════════════════════════════════════
 * IKONALAR TIZIMI
 * ════════════════════════════════════════════════════════════════
 * Loyihada emoji ISHLATILMAYDI. Har qanday belgi shu yerdan olinadi.
 *
 * Qoidalar:
 *   · 24×24 koordinata to'ri, barcha ikonalar bir xil o'lchamda
 *   · fill="none", faqat chiziq (stroke) — to'ldirilgan shakl yo'q
 *   · rang har doim currentColor — ota elementdan meros oladi
 *   · chiziq qalinligi 1.6 (kichik o'lchamda 1.8 ga oshiriladi)
 *
 * Yangi ikona qo'shganda shu uslubga rioya qiling: qo'shimcha
 * detal qo'shmang, ikona 16px da ham tanilishi kerak.
 * ════════════════════════════════════════════════════════════════
 */

const P = {
  /* ─── Navigatsiya ─── */
  attendance: (
    <>
      <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  users: (
    <>
      <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 20v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  megaphone: (
    <>
      <path d="m3 11 17-5v12L3 14z" />
      <path d="M3 11H2.5a1.5 1.5 0 0 0 0 3H3z" />
      <path d="M11 15.4V18a2 2 0 0 1-4 0v-3.6" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6" />
      <path d="M17.5 12.5a1.75 1.75 0 0 0 0 3.5H21v-3.5z" />
    </>
  ),
  settings: (
    <>
      <path d="M5 21v-6M5 11V3M12 21v-9M12 8V3M19 21v-4M19 13V3" />
      <path d="M2 15h6M9 8h6M16 17h6" />
    </>
  ),

  /* ─── Holatlar ─── */
  check: <path d="M20 6 9 17l-5-5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-4.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.9" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
  xCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-5 5M9.5 9.5l5 5" />
    </>
  ),
  moon: <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8z" />,
  thermometer: (
    <>
      <path d="M14 14.5V4a2 2 0 0 0-4 0v10.5a4 4 0 1 0 4 0z" />
      <path d="M12 9v6" />
    </>
  ),
  minus: <path d="M5 12h14" />,

  /* ─── Amallar ─── */
  plus: <path d="M12 5v14M5 12h14" />,
  pencil: (
    <>
      <path d="M13 4 6 11v4h4l7-7" />
      <path d="m16 5 3 3" />
      <path d="M15.5 2.5a2.1 2.1 0 0 1 3 3L18 6l-3-3z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M18 6v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.2-4.2" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-2.6-6.3" />
      <path d="M21 4v5h-5" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V3h10v6" />
      <path d="M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="15" width="10" height="6" rx="1" />
    </>
  ),
  power: (
    <>
      <path d="M12 3v9" />
      <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.9 5.1A9.9 9.9 0 0 1 12 4.9c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.6" />
      <path d="M6.6 6.7A17 17 0 0 0 2.5 11.4S6 17.9 12 17.9a9.6 9.6 0 0 0 4-.85" />
      <path d="M14.1 13.5a3 3 0 0 1-4.2-4.2" />
      <path d="M3 3l18 18" />
    </>
  ),
  chevronLeft: <path d="m14.5 18-6-6 6-6" />,
  chevronRight: <path d="m9.5 18 6-6-6-6" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),

  scan: (
    <>
      <path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8" />
      <path d="M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8" />
      <path d="M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16" />
      <path d="M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16" />
      <path d="M3 12h18" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3z" />
      <path d="M20.5 14v.01M14 20.5v.01M17.5 20.5v.01M20.5 17.5v.01M20.5 20.5v.01" />
    </>
  ),
  note: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),

  /* ─── Sana va vaqt ─── */
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  calendarDays: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </>
  ),

  /* ─── Xabarlar ─── */
  alert: (
    <>
      <path d="M10.3 4 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0z" />
      <path d="M12 10v4M12 17.5h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4.5M12 8h.01" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.2h6c0-.4.2-.9.6-1.2A6 6 0 0 0 12 3z" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="4" />
      <path d="m10.5 12.5 8-8" />
      <path d="m15.5 7.5 2.5 2.5" />
      <path d="m18 5 2.5 2.5" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 21s7-3.5 7-9V5.5L12 3 5 5.5V12c0 5.5 7 9 7 9z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  robot: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 4v4" />
      <circle cx="12" cy="3" r="1" />
      <path d="M9 13h.01M15 13h.01" />
      <path d="M9.5 17h5" />
    </>
  ),

  /* ─── Ko'rsatkichlar ─── */
  trendUp: (
    <>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 15v-3M12 15V8M17 15v-5" />
    </>
  ),
  banknote: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  coins: (
    <>
      <circle cx="9" cy="9" r="6" />
      <path d="M18.1 6.4a6 6 0 0 1 0 11.2" />
      <path d="M15.5 4.5a9 9 0 0 1 0 15" />
    </>
  ),
  percent: (
    <>
      <path d="M19 5 5 19" />
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </>
  ),
  circleDashed: (
    <>
      <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
    </>
  ),

  /* ─── Lavozimlar ─── */
  waiter: (
    <>
      <path d="M2.5 19h19" />
      <path d="M4 19a8 8 0 0 1 16 0" />
      <path d="M10 5h4" />
      <path d="M12 5v2" />
    </>
  ),
  chef: (
    <>
      <path d="M6 14a4 4 0 0 1 1.3-7.8 5 5 0 0 1 9.4 0A4 4 0 0 1 18 14v6H6z" />
      <path d="M6 17h12" />
    </>
  ),
  bowl: (
    <>
      <path d="M2.5 11h19" />
      <path d="M20.5 11a8.5 8.5 0 0 1-17 0" />
      <path d="M8 7.5c.5-1.5 2-2.5 4-2.5s3.5 1 4 2.5" />
    </>
  ),
  plate: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
    </>
  ),
  utensils: (
    <>
      <path d="M5 3v6a2 2 0 0 0 4 0V3" />
      <path d="M7 11v10" />
      <path d="M17 3c-1.5 1.2-2.2 3-2.2 5.2s.7 3.8 2.2 4.8" />
      <path d="M17 3v18" />
    </>
  ),
  folder: (
    <>
      <path d="M3 19V6a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.4.6L12.5 6H19a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15 18 9" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </>
  ),
  droplet: <path d="M12 21a6.5 6.5 0 0 0 6.5-6.5C18.5 10 12 3 12 3s-6.5 7-6.5 11.5A6.5 6.5 0 0 0 12 21z" />,
  shield: <path d="M12 21s7-3.5 7-9V5.5L12 3 5 5.5V12c0 5.5 7 9 7 9z" />,
  briefcase: (
    <>
      <rect x="2.5" y="7" width="19" height="13" rx="2" />
      <path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
      <path d="M2.5 12h19" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  crown: (
    <>
      <path d="M3 7l3.5 3L12 4l5.5 6L21 7l-1.8 11H4.8z" />
      <path d="M4.8 18h14.4" />
    </>
  ),

  /* ─── Brend ─── */
  leaf: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z" />
      <path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 10v10" />
    </>
  ),
}

/**
 * Bazadagi eski emoji qiymatlarini ikona kalitiga o'giradi.
 * Dastlabki versiyada lavozimlar emoji bilan yozilgan edi —
 * shu jadval tufayli eski yozuvlar ham to'g'ri ko'rinadi.
 */
const LEGACY_EMOJI = {
  '🧑‍🍳': 'waiter',
  '👨‍🍳': 'chef',
  '🥗': 'bowl',
  '🔪': 'utensils',
  '💵': 'banknote',
  '🗂️': 'folder',
  '🎀': 'bell',
  '🧹': 'droplet',
  '🛡️': 'shield',
  '👤': 'user',
  '👑': 'crown',
}

/** Ikona nomlari ro'yxati — tanlagich shu ro'yxatdan foydalanadi */
export const POSITION_ICONS = [
  'waiter',
  'chef',
  'bowl',
  'plate',
  'utensils',
  'banknote',
  'folder',
  'bell',
  'droplet',
  'shield',
  'briefcase',
  'user',
  'table',
]

export function resolveIconName(value) {
  if (!value) return 'user'
  if (P[value]) return value
  return LEGACY_EMOJI[value] || 'user'
}

/**
 * @param {string} name        ikona nomi (P dagi kalit)
 * @param {number} size        piksel o'lchami
 * @param {number} strokeWidth chiziq qalinligi
 */
export function Icon({ name, size = 20, strokeWidth, style, className, title }) {
  const content = P[name] || P.circleDashed

  // Kichik o'lchamda chiziq ingichka ko'rinadi — biroz qalinlashtiramiz
  const sw = strokeWidth ?? (size <= 16 ? 1.8 : 1.6)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0, display: 'block', ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {content}
    </svg>
  )
}

/** Ikona uchun yumshoq fonli kvadrat — ko'rsatkich kartochkalarida ishlatiladi */
export function IconTile({ name, size = 34, iconSize = 18, color, bg }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: bg || 'rgba(0,0,0,0.04)',
        color: color || 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={iconSize} />
    </div>
  )
}
