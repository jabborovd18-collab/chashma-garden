/**
 * Bot ko'rgan guruhlar ro'yxati.
 *
 * Direktor botni guruhga qo'shib, guruhga bitta xabar yozadi —
 * shundan keyin guruh shu ro'yxatda paydo bo'ladi va chat ID ni
 * qo'lda topib o'tirish shart emas.
 */

import { requireUser } from '@/lib/server/firebase-admin'
import { getUpdates, extractChats } from '@/lib/server/telegram'
import { ok, fail } from '@/lib/server/api'

// firebase-admin Node muhitini talab qiladi (fayl tizimi, kripto).
// Buni aniq belgilamasak Next uni boshqa muhitda ishga tushirishga
// urinishi va modul yuklanishida yiqilishi mumkin — bunday xato
// handler ichidagi try/catch ga tushmaydi, HTML 500 bo'lib chiqadi.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    await requireUser(request, ['director'])
  } catch (err) {
    return fail(err, 401)
  }

  try {
    const chats = extractChats(await getUpdates())
    return ok({ chats })
  } catch (err) {
    return fail(err, 502)
  }
}
