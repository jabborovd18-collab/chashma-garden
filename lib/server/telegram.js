import 'server-only'

/**
 * ════════════════════════════════════════════════════════════════
 * TELEGRAM BOT — XABAR YUBORISH
 * ════════════════════════════════════════════════════════════════
 * Bot tokeni faqat serverda. `NEXT_PUBLIC_` prefiksi bilan yozilsa
 * u brauzerga tushadi va tokenni topgan har qanday odam bot nomidan
 * xabar yubora oladi — shuning uchun `TELEGRAM_BOT_TOKEN`.
 *
 * Xabarlar HTML formatida yuboriladi (Markdown emas): Markdown'da
 * xodim ismidagi `_` yoki `*` belgisi formatlashni buzib yuboradi,
 * HTML'da esa faqat uchta belgini qochirish yetarli.
 * ════════════════════════════════════════════════════════════════
 */

const API = 'https://api.telegram.org/bot'

export function botTokenMissing() {
  return !process.env.TELEGRAM_BOT_TOKEN
}

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN
  if (!t) throw new Error('TELEGRAM_BOT_TOKEN sozlanmagan')
  return t
}

/** HTML rejimida xavfli uchta belgi */
export function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Telegram API ga murojaat.
 * Xatoni yutmaymiz — chaqiruvchi tomon nima bo'lganini bilishi kerak.
 */
async function call(method, body) {
  const res = await fetch(`${API}${token()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // Telegram sekin javob bersa butun so'rov osilib qolmasin
    signal: AbortSignal.timeout(15000),
  })

  const data = await res.json().catch(() => ({}))

  if (!data.ok) {
    throw new Error(telegramXatosi(data))
  }

  return data.result
}

/** Telegram xatolarini tushunarli o'zbekchaga o'giradi */
function telegramXatosi(data) {
  const kod = data?.error_code
  const matn = data?.description || 'noma’lum xato'

  if (kod === 401) return 'Bot tokeni noto‘g‘ri'
  if (kod === 400 && /chat not found/i.test(matn)) {
    return 'Guruh topilmadi — chat ID noto‘g‘ri yoki bot guruhdan chiqarilgan'
  }
  if (kod === 403) {
    return 'Bot guruhga yoza olmaydi — uni guruhga qo‘shing va administrator qiling'
  }
  if (kod === 429) return 'Juda ko‘p xabar yuborildi, biroz kuting'

  return `Telegram: ${matn}`
}

/**
 * Guruhga xabar yuboradi.
 * chatId bo'sh bo'lsa jim qaytadi — sozlanmagan guruh xato emas.
 *
 * @returns {boolean} yuborildimi
 */
export async function sendMessage(chatId, html) {
  if (!chatId) return false

  await call('sendMessage', {
    chat_id: chatId,
    text: html,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  })

  return true
}

/** Bot haqida ma'lumot — sozlamani tekshirish uchun */
export async function getMe() {
  return call('getMe', {})
}

/**
 * Bot ko'rgan oxirgi yangiliklar.
 * Guruh chat ID sini topish uchun ishlatiladi: direktor botni
 * guruhga qo'shib, guruhga bitta xabar yozadi — shu yerda ko'rinadi.
 */
export async function getUpdates() {
  const res = await fetch(`${API}${token()}/getUpdates?limit=100`, {
    signal: AbortSignal.timeout(15000),
  })
  const data = await res.json().catch(() => ({}))
  if (!data.ok) throw new Error(telegramXatosi(data))
  return data.result || []
}

/**
 * Yangiliklardan guruhlar ro'yxatini ajratib oladi.
 * Bir guruh bir necha marta uchrashi mumkin — takrorlarni olib tashlaymiz.
 */
export function extractChats(updates) {
  const chats = new Map()

  for (const u of updates) {
    const msg = u.message || u.channel_post || u.my_chat_member || u.edited_message
    const chat = msg?.chat
    if (!chat) continue

    chats.set(String(chat.id), {
      id: String(chat.id),
      title: chat.title || chat.username || chat.first_name || 'Nomsiz',
      // guruh, superguruh yoki kanal — shaxsiy yozishmalar kerak emas
      type: chat.type,
    })
  }

  return [...chats.values()].filter((c) => c.type !== 'private')
}
