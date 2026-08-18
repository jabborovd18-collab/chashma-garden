/**
 * ════════════════════════════════════════════════════════════════
 * XATO XABARLARINI O'ZBEKCHAGA O'GIRISH
 * ════════════════════════════════════════════════════════════════
 * Firebase o'z xabarlarini inglizcha va texnik tilda beradi
 * («Missing or insufficient permissions.»). Foydalanuvchiga ularni
 * ko'rsatishning ma'nosi yo'q — u nima qilishni bilmaydi.
 *
 * Shuning uchun barcha `catch` bloklarida xom `err.message` emas,
 * shu fayldagi funksiya ishlatiladi.
 * ════════════════════════════════════════════════════════════════
 */

const MESSAGES = {
  /* ─── Kirish (Firebase Auth) ─── */
  'auth/invalid-email': 'Login noto‘g‘ri yozilgan',
  'auth/user-disabled': 'Bu hisob bloklangan. Direktorga murojaat qiling',
  'auth/user-not-found': 'Bunday login topilmadi',
  'auth/wrong-password': 'Parol noto‘g‘ri',
  'auth/invalid-credential': 'Login yoki parol noto‘g‘ri',
  'auth/too-many-requests': 'Juda ko‘p urinish bo‘ldi. Bir necha daqiqadan so‘ng qayta urining',
  'auth/network-request-failed': 'Internet aloqasi yo‘q',
  'auth/email-already-in-use': 'Bu login allaqachon band — boshqasini tanlang',
  'auth/weak-password': 'Parol juda oddiy — kamida 6 ta belgi bo‘lsin',
  'auth/requires-recent-login': 'Xavfsizlik uchun qaytadan kiring va amalni takrorlang',
  'auth/operation-not-allowed':
    'Firebase Console → Authentication bo‘limida Email/Password usulini yoqing',
  'auth/unauthorized-domain':
    'Bu domen Firebase’da ruxsat etilmagan. Authentication → Settings → Authorized domains ga qo‘shing',

  /* ─── Baza (Firestore) ─── */
  // Eng ko'p uchraydigan sabab: yangi kolleksiya qo'shilgan, lekin
  // firestore.rules Firebase Console'ga joylanmagan. Qoidasiz
  // kolleksiya avtomatik yopiq bo'ladi.
  'permission-denied':
    'Ma’lumotga ruxsat yo‘q. Agar bu yangi bo‘lim bo‘lsa, firestore.rules Firebase Console’da yangilanmagan bo‘lishi mumkin',
  unavailable: 'Bazaga ulanib bo‘lmadi. Internetni tekshiring',
  'failed-precondition':
    'So‘rov uchun Firestore indeksi kerak. Konsoldagi havola orqali indeksni yarating',
  'not-found': 'Yozuv topilmadi — o‘chirib yuborilgan bo‘lishi mumkin',
  'already-exists': 'Bunday yozuv allaqachon mavjud',
  cancelled: 'So‘rov bekor qilindi',
  'deadline-exceeded': 'Server javob bermadi. Qayta urinib ko‘ring',
  'resource-exhausted': 'Firebase kunlik chegarasi tugagan',
}

/**
 * Firebase xatosini o'qiladigan o'zbekcha xabarga aylantiradi.
 * Noma'lum xato bo'lsa xom xabar qaytariladi — yo'qotib qo'ymaslik uchun.
 */
export function authErrorMessage(err, fallback = 'Xatolik yuz berdi') {
  if (!err) return fallback
  const code = err.code || ''
  if (MESSAGES[code]) return MESSAGES[code]

  // Firestore ba'zan kodni bermay, faqat matn qaytaradi
  if (/insufficient permissions/i.test(err.message || '')) {
    return MESSAGES['permission-denied']
  }

  return err.message || fallback
}

/** Qisqa taxallus — baza xatolari uchun ham xuddi shu funksiya */
export const errorMessage = authErrorMessage
