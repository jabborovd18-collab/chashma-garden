/**
 * Sinov xabari — guruh ID to'g'ri kiritilganini tekshirish uchun.
 * Direktor sozlamalarni saqlashdan oldin bosib ko'radi.
 */

import { requireUser } from '@/lib/server/firebase-admin'
import { sendMessage } from '@/lib/server/telegram'
import { testMessage } from '@/lib/server/messages'
import { ok, fail } from '@/lib/server/api'

export async function POST(request) {
  let user
  try {
    user = await requireUser(request, ['director'])
  } catch (err) {
    return fail(err, 401)
  }

  const { chatId, guruhNomi } = await request.json().catch(() => ({}))

  if (!chatId) return fail('Guruh chat ID kiritilmagan')

  try {
    await sendMessage(chatId, testMessage(guruhNomi || 'guruh', user.name))
    return ok()
  } catch (err) {
    return fail(err, 502)
  }
}
