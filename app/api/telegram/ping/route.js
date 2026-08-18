/**
 * Eng sodda marshrut — hech qanday og'ir kutubxona import qilmaydi.
 *
 * Vazifasi: muammo qayerdaligini ajratish. Agar bu marshrut ishlab,
 * qolganlari 500 bersa — sabab `firebase-admin` ni yuklashda,
 * marshrutlashda emas.
 *
 * Maxfiy ma'lumot qaytarmaydi: faqat o'zgaruvchi BOR-YO'QLIGI
 * ko'rsatiladi, qiymati emas.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const bor = (name) => !!(process.env[name] || '').trim()

  return Response.json({
    ok: true,
    node: process.version,
    ozgaruvchilar: {
      FIREBASE_PROJECT_ID: bor('FIREBASE_PROJECT_ID'),
      FIREBASE_CLIENT_EMAIL: bor('FIREBASE_CLIENT_EMAIL'),
      FIREBASE_PRIVATE_KEY: bor('FIREBASE_PRIVATE_KEY'),
      TELEGRAM_BOT_TOKEN: bor('TELEGRAM_BOT_TOKEN'),
      CRON_SECRET: bor('CRON_SECRET'),
    },
    // Kalit to'g'ri ko'chirilganini bilish uchun: uzunligi va
    // boshlanishi. Kalitning o'zi hech qachon qaytarilmaydi.
    kalitHolati: (() => {
      const k = process.env.FIREBASE_PRIVATE_KEY || ''
      if (!k) return 'yo‘q'
      return {
        uzunligi: k.length,
        BEGINbilanBoshlanadi: k.replace(/^["']/, '').startsWith('-----BEGIN'),
        qatorKochirishBor: k.includes('\n'),
        slashNbor: k.includes('\\n'),
      }
    })(),
  })
}
