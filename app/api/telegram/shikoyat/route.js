/**
 * Shikoyatni Telegram guruhiga yuborish.
 *
 * Mijoz shikoyatni Firestore'ga yozgandan keyin bu marshrutni
 * chaqiradi va faqat hujjat id sini beradi. Xabar matni server
 * tomonida bazadan o'qib tuziladi — shunda mijoz yuborilayotgan
 * matnni o'zgartira olmaydi.
 */

import { requireUser, adminDb } from '@/lib/server/firebase-admin'
import { sendMessage } from '@/lib/server/telegram'
import { complaintMessage } from '@/lib/server/messages'
import { ok, fail } from '@/lib/server/api'

// firebase-admin Node muhitini talab qiladi (fayl tizimi, kripto).
// Buni aniq belgilamasak Next uni boshqa muhitda ishga tushirishga
// urinishi va modul yuklanishida yiqilishi mumkin — bunday xato
// handler ichidagi try/catch ga tushmaydi, HTML 500 bo'lib chiqadi.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    await requireUser(request, ['director', 'admin', 'hostes'])
  } catch (err) {
    return fail(err, 401)
  }

  const { complaintId } = await request.json().catch(() => ({}))
  if (!complaintId) return fail('complaintId yuborilmadi')

  try {
    const db = adminDb()

    const [sozlama, hujjat] = await Promise.all([
      db.collection('settings').doc('app').get(),
      db.collection('complaints').doc(complaintId).get(),
    ])

    if (!hujjat.exists) return fail('Shikoyat topilmadi', 404)

    const tg = sozlama.data()?.telegram || {}
    if (!tg.enabled) return ok({ yuborildi: false, sabab: 'Bot o‘chirilgan' })
    if (!tg.complaintsChatId) return ok({ yuborildi: false, sabab: 'Guruh sozlanmagan' })

    const c = hujjat.data()
    if (c.sentToTelegram) return ok({ yuborildi: false, sabab: 'Allaqachon yuborilgan' })

    await sendMessage(tg.complaintsChatId, complaintMessage(c))

    // Ikki marta yuborilmasligi uchun belgilab qo'yamiz
    await hujjat.ref.update({ sentToTelegram: true })

    return ok({ yuborildi: true })
  } catch (err) {
    return fail(err, 502)
  }
}
