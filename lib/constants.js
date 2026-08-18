/**
 * ════════════════════════════════════════════════════════════════
 * O'ZGARMAS QIYMATLAR
 * ════════════════════════════════════════════════════════════════
 */

/* ─── Dizayn ranglari ─────────────────────────────────────────── */

export const COLORS = {
  primary: '#2F6B3A',
  primaryDark: '#1E4A28',
  primaryLight: '#4C9459',
  primarySoft: '#EDF4EE',

  white: '#FFFFFF',
  bg: '#F6F7F6',
  surface: '#FFFFFF',

  text: '#1A1D1B',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  border: '#E3E6E3',
  borderStrong: '#CDD2CD',

  danger: '#B4241F',
  dangerSoft: '#FBEDEC',
  warning: '#9A6206',
  warningSoft: '#FBF3E4',
  info: '#1F5C8B',
  infoSoft: '#EDF3F8',
  success: '#2F6B3A',

  zebra: '#FAFBFA',
}

/**
 * Vizual shkala. CLAUDE.md 1.3-bandiga qarang — bu qiymatlardan
 * chetga chiqilmaydi, aks holda interfeys tarqoq ko'rinadi.
 */
export const UI = {
  radius: { card: 10, control: 8, chip: 6, pill: 999 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  control: { height: 38, heightSm: 34 },
}

/* ─── Vaqt mintaqasi ──────────────────────────────────────────── */
// Restoran O'zbekistonda. Server (Vercel) UTC da ishlaydi, shuning
// uchun sana va vaqt hamma joyda aniq Toshkent vaqtida hisoblanadi.

export const TZ = 'Asia/Tashkent'

/* ─── Foydalanuvchi rollari ───────────────────────────────────── */

export const ROLES = {
  director: {
    id: 'director',
    label: 'Direktor',
    icon: 'crown',
    desc: 'Hamma narsa: xodimlar, stavkalar, oylik, sozlamalar',
  },
  admin: {
    id: 'admin',
    label: 'Administrator',
    icon: 'folder',
    desc: 'Xodimlar, davomat, shikoyat, avans, oylik hisobot',
  },
  kassir: {
    id: 'kassir',
    label: 'Kassir',
    icon: 'banknote',
    desc: 'Pul berish, jarima nazorati, xodim zimmasiga summa yozish',
  },
  hostes: {
    id: 'hostes',
    label: 'Hostes',
    icon: 'bell',
    desc: 'Faqat davomat belgilash va shikoyat kiritish',
  },
  worker: {
    id: 'worker',
    label: 'Xodim',
    icon: 'user',
    desc: 'Shaxsiy kabinet: faqat o‘z oyligi, davomati va eslatmalari',
  },
}

/**
 * Nazorat paneliga kira oladigan rollar.
 * `worker` bu yerda yo'q — xodimlar «Xodimlar» bo'limida yaratiladi
 * va ular panelga emas, shaxsiy kabinetga kiradi.
 */
export const ROLE_LIST = [ROLES.director, ROLES.admin, ROLES.kassir, ROLES.hostes]

/** Har bir bo'limga qaysi rollar kira oladi */
export const PAGE_ACCESS = {
  davomat: ['director', 'admin', 'hostes'],
  shikoyatlar: ['director', 'admin', 'hostes'],
  ishchilar: ['director', 'admin'],
  kassa: ['director', 'admin', 'kassir'],
  hisobot: ['director', 'admin', 'kassir'],
  sozlamalar: ['director'],
}

/* ─── Davomat holatlari ───────────────────────────────────────── */

export const STATUS = {
  keldi: { id: 'keldi', label: 'Keldi', icon: 'checkCircle', color: COLORS.success, paid: true },
  kech: { id: 'kech', label: 'Kechikdi', icon: 'clock', color: COLORS.warning, paid: true },
  kelmadi: { id: 'kelmadi', label: 'Kelmadi', icon: 'xCircle', color: COLORS.danger, paid: false },
  dam: { id: 'dam', label: 'Dam olish', icon: 'moon', color: COLORS.info, paid: false },
  kasal: { id: 'kasal', label: 'Kasal', icon: 'thermometer', color: COLORS.textMuted, paid: false },
}

/** Qo'lda tanlanadigan holatlar (keldi/kech avtomatik aniqlanadi) */
export const MANUAL_STATUSES = ['kelmadi', 'dam', 'kasal']

/* ─── Jarima sozlamalari (standart qiymatlar) ─────────────────── */

export const DEFAULT_SETTINGS = {
  /** Kechikish shu daqiqagacha jarimasiz kechiriladi */
  graceMinutes: 10,

  /** 'tiered' — pog'onali foiz, 'per_minute' — har daqiqa uchun summa */
  penaltyMode: 'tiered',

  /** per_minute rejimi uchun: 1 daqiqa necha so'm */
  perMinuteAmount: 2000,

  /**
   * tiered rejimi uchun pog'onalar.
   * minutes — jarimali kechikish shu daqiqadan oshsa,
   * percent — kunlik stavkadan shuncha foiz ushlanadi.
   */
  tiers: [
    { minutes: 0, percent: 10 },
    { minutes: 30, percent: 25 },
    { minutes: 60, percent: 50 },
  ],

  /** Jarima kunlik stavkaning shu foizidan oshmaydi */
  maxPenaltyPercent: 100,

  /** Lavozimda smena vaqti ko'rsatilmagan bo'lsa ishlatiladi */
  defaultShiftStart: '09:00',

  /** Telegram — 2-bosqichda ishga tushadi */
  telegram: {
    complaintsChatId: '',
    attendanceChatId: '',
    adminChatId: '',
    reportTimes: ['13:00', '19:00'],
    enabled: false,
  },
}

/* ─── Boshlang'ich lavozimlar ─────────────────────────────────── */
// Birinchi ishga tushirishda bazaga yoziladi, keyin panelda tahrirlanadi.

// Kassir bu yerda YO'Q: u davomati yuritiladigan zal xodimi emas,
// balki panelning alohida roli (ROLES.kassir) — pulni u beradi.
export const SEED_POSITIONS = [
  { name: 'Afitsant', icon: 'waiter', shiftStart: '09:00', defaultRate: 90000, order: 1 },
  { name: 'Raner', icon: 'plate', shiftStart: '09:00', defaultRate: 70000, order: 2 },
  { name: 'Salatchi', icon: 'bowl', shiftStart: '08:00', defaultRate: 110000, order: 3 },
  { name: 'Oshpaz', icon: 'chef', shiftStart: '08:00', defaultRate: 150000, order: 4 },
  { name: 'Zakadovkachi', icon: 'utensils', shiftStart: '07:00', defaultRate: 100000, order: 5 },
]

/* ─── Shikoyat manbalari ──────────────────────────────────────── */

export const COMPLAINT_SOURCES = [
  { id: 'kassir', label: 'Kassir' },
  { id: 'administrator', label: 'Administrator' },
  { id: 'hostes', label: 'Hostes' },
  { id: 'boshqa', label: 'Boshqa' },
]

export const COMPLAINT_STATUS = {
  yangi: { id: 'yangi', label: 'Yangi', color: COLORS.danger },
  muhokamada: { id: 'muhokamada', label: 'Muhokamada', color: COLORS.warning },
  hal: { id: 'hal', label: 'Hal qilindi', color: COLORS.success },
}

export const OYLAR = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]
