/**
 * Bot sozlamasi holati — Sozlamalar sahifasi shu orqali
 * "nima yetishmayapti" ni ko'rsatadi.
 */

import { requireUser, adminConfigMissing } from '@/lib/server/firebase-admin'
import { botTokenMissing, getMe } from '@/lib/server/telegram'
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

  const serverSozlanmagan = adminConfigMissing()
  const tokenYoq = botTokenMissing()

  let bot = null
  let botXatosi = null

  if (!tokenYoq) {
    try {
      const me = await getMe()
      bot = { username: me.username, name: me.first_name }
    } catch (err) {
      botXatosi = err.message
    }
  }

  return ok({
    serverSozlangan: serverSozlanmagan.length === 0,
    yetishmaydi: serverSozlanmagan,
    tokenBor: !tokenYoq,
    cronSozlangan: !!(process.env.CRON_SECRET || '').trim(),
    bot,
    botXatosi,
  })
}
