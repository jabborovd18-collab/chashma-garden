/**
 * ════════════════════════════════════════════════════════════════
 * YIG'MA DAVOMAT HISOBOTI — KUNIGA IKKI MARTA
 * ════════════════════════════════════════════════════════════════
 * Adminlar guruhiga lavozimlar kesimida holat yuboriladi:
 *   Afitsant  28/32,  Oshpaz 7/8,  Salatchi 4/5 ...
 *
 * Ikki xil chaqiruvni qabul qiladi:
 *   · cron        — CRON_SECRET bilan (Vercel Cron yoki cron-job.org)
 *   · direktor    — Sozlamalar sahifasidagi "Hozir yuborish" tugmasi
 *
 * Vercel Hobby tarifida cron kuniga bir marta ishlaydi, shuning
 * uchun ikkinchi vaqt uchun tashqi bepul xizmat ishlatiladi.
 * ════════════════════════════════════════════════════════════════
 */

import { requireUser, adminDb } from '@/lib/server/firebase-admin'
import { sendMessage } from '@/lib/server/telegram'
import { reportMessage } from '@/lib/server/messages'
import { summarizeByPosition } from '@/lib/payroll'
import { dateKey, timeNow } from '@/lib/utils'
import { STATUS } from '@/lib/constants'
import { ok, fail, cronAuthorized } from '@/lib/server/api'

async function yubor(request) {
  // Cron kalitisiz kelgan bo'lsa — faqat direktor chaqira oladi
  if (!cronAuthorized(request)) {
    try {
      await requireUser(request, ['director'])
    } catch (err) {
      return fail(err, 401)
    }
  }

  try {
    const db = adminDb()
    const sana = dateKey()

    const [sozlamaSnap, xodimlarSnap, lavozimlarSnap, davomatSnap] = await Promise.all([
      db.collection('settings').doc('app').get(),
      db.collection('workers').get(),
      db.collection('positions').orderBy('order', 'asc').get(),
      db.collection('attendance').where('date', '==', sana).get(),
    ])

    const tg = sozlamaSnap.data()?.telegram || {}
    if (!tg.enabled) return ok({ yuborildi: false, sabab: 'Bot o‘chirilgan' })
    if (!tg.adminChatId) return ok({ yuborildi: false, sabab: 'Adminlar guruhi sozlanmagan' })

    const olish = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const xodimlar = olish(xodimlarSnap).filter((w) => w.active !== false)
    const lavozimlar = olish(lavozimlarSnap)
    const yozuvlar = olish(davomatSnap)

    const guruhlar = summarizeByPosition(xodimlar, yozuvlar, lavozimlar)

    const kelgan = yozuvlar.filter((r) => STATUS[r.status]?.paid).length
    const umumiy = {
      jami: xodimlar.length,
      kelgan,
      kechikkan: yozuvlar.filter((r) => r.status === 'kech').length,
      kelmagan: yozuvlar.filter((r) => r.status === 'kelmadi').length,
      belgilanmagan: xodimlar.length - yozuvlar.length,
    }

    await sendMessage(tg.adminChatId, reportMessage(guruhlar, umumiy, sana, timeNow()))

    return ok({ yuborildi: true, kelgan, jami: umumiy.jami })
  } catch (err) {
    return fail(err, 502)
  }
}

// Vercel Cron GET yuboradi, tashqi xizmatlar ham odatda GET.
// Sozlamalar sahifasidagi tugma esa POST qiladi.
export async function GET(request) {
  return yubor(request)
}

export async function POST(request) {
  return yubor(request)
}
