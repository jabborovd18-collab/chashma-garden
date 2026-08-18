/**
 * Firebase Auth xato kodlarini o'zbekcha, tushunarli xabarga aylantiradi.
 * Firebase'ning o'z xabarlari inglizcha va texnik — foydalanuvchiga
 * ularni ko'rsatishning ma'nosi yo'q.
 */

const MESSAGES = {
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
  'permission-denied': 'Sizda bu amal uchun ruxsat yo‘q',
  unavailable: 'Bazaga ulanib bo‘lmadi. Internetni tekshiring',
}

export function authErrorMessage(err) {
  if (!err) return 'Noma’lum xatolik'
  const code = err.code || ''
  return MESSAGES[code] || err.message || 'Xatolik yuz berdi'
}
