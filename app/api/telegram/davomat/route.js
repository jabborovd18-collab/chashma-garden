/**
 * Xodim kelgani haqida davomat guruhiga xabar.
 *
 * Davomat sahifasi «Keldi» bosilgandan keyin chaqiradi.
 * Xabar matni bazadagi yozuvdan tuziladi — mijoz nima yuborishni
 * o'zi hal qilmaydi.
 */

import { requireUser, adminDb } from '@/lib/server/firebase-admin'
import { sendMessage } from '@/lib/server/telegram'
import { arrivalMessage } from '@/lib/server/messages'
import { ok, fail } from '@/lib/server/api'

export async function POST(request) {
  try {
    await requireUser(request, ['director', 'admin', 'hostes'])
  } catch (err) {
    return fail(err, 401)
  }

  const { attendanceId } = await request.json().catch(() => ({}))
  if (!attendanceId) return fail('attendanceId yuborilmadi')

  try {
    const db = adminDb()

    const [sozlama, hujjat] = await Promise.all([
      db.collection('settings').doc('app').get(),
      db.collection('attendance').doc(attendanceId).get(),
    ])

    if (!hujjat.exists) return fail('Davomat yozuvi topilmadi', 404)

    const tg = sozlama.data()?.telegram || {}
    if (!tg.enabled) return ok({ yuborildi: false, sabab: 'Bot o‘chirilgan' })
    if (!tg.attendanceChatId) return ok({ yuborildi: false, sabab: 'Guruh sozlanmagan' })

    const rec = hujjat.data()

    // Faqat kelganlar haqida yoziladi: "kelmadi", "dam", "kasal"
    // holatlari guruhda shovqin bo'ladi, ular hisobotda ko'rinadi
    if (rec.status !== 'keldi' && rec.status !== 'kech') {
      return ok({ yuborildi: false, sabab: 'Kelmagan holat' })
    }

    // Sozlamada "faqat kechikkanlar" tanlangan bo'lsa
    if (tg.onlyLate && rec.status !== 'kech') {
      return ok({ yuborildi: false, sabab: 'Faqat kechikkanlar rejimi' })
    }

    // Bir yozuv uchun ikkinchi marta yozilmasin: vaqt tahrirlansa
    // xabar qayta ketmasligi kerak
    if (rec.sentToTelegram) return ok({ yuborildi: false, sabab: 'Allaqachon yuborilgan' })

    await sendMessage(tg.attendanceChatId, arrivalMessage(rec))
    await hujjat.ref.update({ sentToTelegram: true })

    return ok({ yuborildi: true })
  } catch (err) {
    return fail(err, 502)
  }
}
