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
