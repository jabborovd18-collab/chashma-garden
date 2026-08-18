'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * QR KOD KO'RSATISH
 * ════════════════════════════════════════════════════════════════
 * SVG chiqaramiz, rasm emas: har qanday o'lchamda aniq qoladi va
 * chop etilganda ham chetlari to'g'ri chiqadi.
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { COLORS, UI } from '@/lib/constants'

export function QrCode({ value, size = 200, level = 'M' }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    setError(false)

    QRCode.toString(String(value ?? ''), {
      type: 'svg',
      margin: 1,
      width: size,
      // 'M' — belgilarning ~15% i shikastlansa ham o'qiladi.
      // Telefon ekrani yoki qog'oz chizilib qolsa yordam beradi.
      errorCorrectionLevel: level,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setError(true))

    return () => {
      alive = false
    }
  }, [value, size, level])

  if (error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${COLORS.border}`,
          borderRadius: UI.radius.control,
          fontSize: 12,
          color: COLORS.textMuted,
          textAlign: 'center',
          padding: 12,
        }}
      >
        QR yaratib bo‘lmadi
      </div>
    )
  }

  return (
    <div
      // Mazmun qrcode kutubxonasi yaratgan SVG — tashqi ma'lumot emas
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{
        width: size,
        height: size,
        lineHeight: 0,
        background: '#FFFFFF',
        borderRadius: 4,
      }}
    />
  )
}
