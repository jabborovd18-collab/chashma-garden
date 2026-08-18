import 'server-only'

/**
 * ════════════════════════════════════════════════════════════════
 * TELEGRAM XABARLARI MATNI
 * ════════════════════════════════════════════════════════════════
 * Bu yerda ham emoji ishlatilmaydi (CLAUDE.md 1.1). Telegram'da
 * SVG ikona qo'yib bo'lmaydi, lekin qalin shrift va bo'shliq bilan
 * tuzilma yasash yetarli — xabar jiddiy va o'qilishi oson chiqadi.
 *
 * Jadval ko'rinishidagi qismlar <pre> ichida beriladi: Telegram uni
 * bir xil kenglikdagi shrift bilan chizadi, ustunlar tekis turadi.
 * ════════════════════════════════════════════════════════════════
 */

import { esc } from './telegram'
import { formatDate, formatSom, formatDuration } from '../utils'

/* ─── Shikoyat ───────────────────────────────────────────────── */

export function complaintMessage(c) {
  const qatorlar = [
    '<b>YANGI SHIKOYAT</b>',
    '',
    esc(c.text),
    '',
  ]

  const meta = []
  if (c.takenBy) meta.push(`Qabul qildi: ${esc(c.takenBy)}`)
  if (c.customer) meta.push(`Mijoz: ${esc(c.customer)}`)
  if (c.tableNo) meta.push(`Stol: ${esc(c.tableNo)}`)
  if (c.aboutWorkerName) meta.push(`Tegishli xodim: <b>${esc(c.aboutWorkerName)}</b>`)

  qatorlar.push(meta.join('\n'))
  qatorlar.push('')
  qatorlar.push(`<i>${esc(formatDate(c.date))}${c.time ? `, ${esc(c.time)}` : ''}</i>`)

  return qatorlar.join('\n')
}

/* ─── Xodim keldi ────────────────────────────────────────────── */

export function arrivalMessage(rec) {
  const kech = rec.status === 'kech'
  const ism = `<b>${esc(rec.workerName)}</b>`
  const lavozim = rec.positionName ? ` — ${esc(rec.positionName)}` : ''

  if (!kech) {
    return `${ism}${lavozim}\nKeldi: ${esc(rec.checkIn)}`
  }

  const tafsilot = [`Kechikdi: ${esc(rec.checkIn)}`]
  if (rec.late > 0) tafsilot.push(`(${formatDuration(rec.late)})`)
  if (rec.penalty > 0) tafsilot.push(`· jarima ${formatSom(rec.penalty)} so'm`)

  return `${ism}${lavozim}\n${tafsilot.join(' ')}`
}

/* ─── Yig'ma hisobot ─────────────────────────────────────────── */

/**
 * @param {Array}  guruhlar  summarizeByPosition natijasi
 * @param {object} umumiy    {kelgan, jami, kechikkan, kelmagan, belgilanmagan}
 * @param {string} sana      '2026-08-19'
 * @param {string} vaqt      '13:00'
 */
export function reportMessage(guruhlar, umumiy, sana, vaqt) {
  // Ustunlar tekis turishi uchun eng uzun nomga qarab tenglashtiramiz
  const eng = Math.max(...guruhlar.map((g) => g.name.length), 0)

  const jadval = guruhlar
    .map((g) => {
      const nom = g.name.padEnd(eng, ' ')
      const son = `${g.kelgan}/${g.jami}`.padStart(6, ' ')
      const kech = g.kechikkan > 0 ? `  ${g.kechikkan} kech` : ''
      return `${nom} ${son}${kech}`
    })
    .join('\n')

  const qatorlar = [
    '<b>DAVOMAT HISOBOTI</b>',
    `${esc(formatDate(sana))}, soat ${esc(vaqt)} holatiga`,
    '',
  ]

  if (guruhlar.length > 0) {
    qatorlar.push(`<pre>${esc(jadval)}</pre>`)
  } else {
    qatorlar.push('<i>Xodimlar ro‘yxati bo‘sh</i>')
  }

  qatorlar.push('')
  qatorlar.push(`<b>Jami keldi: ${umumiy.kelgan} / ${umumiy.jami}</b>`)

  const qoshimcha = []
  if (umumiy.kechikkan > 0) qoshimcha.push(`Kechikkan: ${umumiy.kechikkan}`)
  if (umumiy.kelmagan > 0) qoshimcha.push(`Kelmagan: ${umumiy.kelmagan}`)
  if (umumiy.belgilanmagan > 0) qoshimcha.push(`Belgilanmagan: ${umumiy.belgilanmagan}`)
  if (qoshimcha.length) qatorlar.push(qoshimcha.join('\n'))

  return qatorlar.join('\n')
}

/* ─── Sinov ──────────────────────────────────────────────────── */

export function testMessage(guruhNomi, kim) {
  return [
    '<b>Ulanish tekshirildi</b>',
    '',
    `Bu — «${esc(guruhNomi)}» uchun sinov xabari.`,
    'Bot guruhga yoza olyapti, sozlama to‘g‘ri.',
    '',
    `<i>Yuborgan: ${esc(kim)}</i>`,
  ].join('\n')
}
