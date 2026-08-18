/**
 * ════════════════════════════════════════════════════════════════
 * LOGIN (USERNAME) TIZIMI
 * ════════════════════════════════════════════════════════════════
 * Firebase Auth username'ni qo'llab-quvvatlamaydi — faqat email,
 * telefon yoki tashqi hisob (Google va h.k.).
 *
 * Shu sababli login ichki ravishda emailga aylantiriladi:
 *     aziz.karimov  →  aziz.karimov@chashma.local
 *
 * Foydalanuvchi buni hech qachon ko'rmaydi. Buning evaziga
 * parolni shifrlash, parol topishga urinishlarni bloklash va
 * seansni boshqarish Firebase zimmasida qoladi — bularni o'zimiz
 * yozganimizda xatoga yo'l qo'yish ehtimoli juda yuqori bo'lardi.
 *
 * Login takrorlanmasligi ham shu orqali ta'minlanadi: Firebase
 * bir xil emailga ikkinchi hisob ochishga yo'l qo'ymaydi.
 * ════════════════════════════════════════════════════════════════
 */

/** Haqiqiy pochta emas — hech qachon xat yuborilmaydi */
export const LOGIN_DOMAIN = 'chashma.local'

const MIN = 3
const MAX = 20
const PATTERN = /^[a-z][a-z0-9._-]*$/

/**
 * Loginni Firebase uchun emailga aylantiradi.
 * Ichida `@` bo'lsa — bu eski email hisobi, o'zgartirmasdan qaytaramiz.
 */
export function loginToEmail(input) {
  const v = String(input ?? '').trim().toLowerCase()
  if (!v) return ''
  if (v.includes('@')) return v
  return `${v}@${LOGIN_DOMAIN}`
}

/** Emaildan loginni ajratib oladi (ko'rsatish uchun) */
export function emailToLogin(email) {
  const v = String(email ?? '').trim()
  if (!v) return ''
  return v.endsWith(`@${LOGIN_DOMAIN}`) ? v.slice(0, -(LOGIN_DOMAIN.length + 1)) : v
}

/**
 * Yangi login yaratishda kiritilgan matnni tozalaydi.
 * Faqat ruxsat etilgan belgilar qoladi — shuning uchun buni
 * KIRISH sahifasida ishlatmang: u `@` ni ham o'chirib yuboradi
 * va eski email hisoblari bilan kirib bo'lmay qoladi.
 */
export function normalizeLogin(input) {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
}

/**
 * Kirish sahifasi uchun yengil tozalash: faqat ortiqcha bo'sh joy
 * olib tashlanadi va kichik harfga o'giriladi.
 *
 * Belgilar o'chirilmaydi, chunki foydalanuvchi login o'rniga to'liq
 * email yozishi mumkin (tizim username'ga o'tishdan oldin ochilgan
 * hisoblar). Kiritilgan qiymat to'g'rimi-yo'qmi — buni Firebase
 * aytadi, biz oldindan buzib qo'ymaymiz.
 */
export function normalizeSignIn(input) {
  return String(input ?? '').trim().toLowerCase()
}

/**
 * Login qoidalarga mos keladimi?
 * @returns {string|null} xato matni yoki null
 */
export function validateLogin(input) {
  const v = String(input ?? '').trim().toLowerCase()

  if (!v) return 'Login kiriting'
  if (v.length < MIN) return `Login kamida ${MIN} ta belgidan iborat bo‘lsin`
  if (v.length > MAX) return `Login ${MAX} ta belgidan uzun bo‘lmasin`
  if (!PATTERN.test(v)) {
    return 'Login lotin harfi bilan boshlanib, faqat kichik harf, raqam va . _ - belgilaridan iborat bo‘lsin'
  }
  return null
}

/**
 * Ism-familiyadan login taklif qiladi: 'Aziz Karimov' → 'aziz.karimov'
 * Direktor har bir xodim uchun login o'ylab o'tirmasligi uchun.
 */
export function suggestLogin(fullName) {
  const translit = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q',
    ғ: 'g', ҳ: 'h',
  }

  const base = String(fullName ?? '')
    .toLowerCase()
    .split('')
    .map((ch) => translit[ch] ?? ch)
    .join('')
    .replace(/[‘’'`]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('.')

  return base.slice(0, MAX)
}
