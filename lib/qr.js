/**
 * ════════════════════════════════════════════════════════════════
 * QR KOD MAZMUNI
 * ════════════════════════════════════════════════════════════════
 * QR ichida xodimning Firestore hujjat id si turadi, oldiga bizning
 * belgimiz qo'shiladi:
 *
 *     CG1:smkSotGPLTaL7e9Lun7E
 *
 * Belgi nima uchun kerak: skaner tasodifan boshqa QR ni (do'kon
 * chekidagi, mahsulot qadog'idagi) o'qib qolsa, uni darhol rad
 * etadi va "bu bizning kod emas" deb aytadi. Belgisiz bo'lsa,
 * tizim uni xodim id si deb o'ylab bazadan qidirib yurardi.
 *
 * Raqam (1) — versiya. Kelajakda QR mazmuni o'zgarsa, eski
 * kartalarni ham tanib olish uchun kerak bo'ladi.
 *
 * ─── Xavfsizlik haqida ───
 * QR ichida maxfiy narsa yo'q — faqat hujjat id si. Uni bilgan
 * odam ham bazadan hech narsa o'qiy olmaydi: barcha so'rovlar
 * firestore.rules orqali o'tadi va rolsiz foydalanuvchiga yopiq.
 *
 * QR ni skanerlaydigan odam — hostes yoki administrator, ya'ni
 * ishonchli xodim. Xodim o'z kodini boshqasiga berib yuborishi
 * mumkin, shuning uchun skanerdan keyin ism ko'rsatiladi va
 * tasdiqlash so'raladi.
 * ════════════════════════════════════════════════════════════════
 */

export const QR_PREFIX = 'CG1:'

/** Xodim id sidan QR mazmunini yasaydi */
export function workerQrValue(workerId) {
  return `${QR_PREFIX}${workerId}`
}

/**
 * Skanerlangan matndan xodim id sini ajratadi.
 * @returns {string|null} id yoki null (bizning kod bo'lmasa)
 */
export function parseQrValue(text) {
  const v = String(text ?? '').trim()
  if (!v.startsWith(QR_PREFIX)) return null

  const id = v.slice(QR_PREFIX.length).trim()
  return id.length > 0 ? id : null
}

/** Kamera xatosini tushunarli o'zbekcha xabarga aylantiradi */
export function cameraErrorMessage(err) {
  const name = err?.name || ''

  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Kameraga ruxsat berilmadi. Brauzer manzil qatoridagi kamera belgisini bosib ruxsat bering'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'Bu qurilmada kamera topilmadi'
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Kamera band — boshqa dastur uni ishlatayotgan bo‘lishi mumkin'
    case 'OverconstrainedError':
      return 'Mos kamera topilmadi'
    case 'SecurityError':
      return 'Kamera faqat xavfsiz (https) ulanishda ishlaydi'
    default:
      return err?.message || 'Kamerani ochib bo‘lmadi'
  }
}

/** Brauzer kamerani umuman qo'llab-quvvatlaydimi? */
export function cameraSupported() {
  if (typeof navigator === 'undefined') return false
  // http orqali ochilganda mediaDevices umuman mavjud bo'lmaydi
  return !!navigator.mediaDevices?.getUserMedia
}
