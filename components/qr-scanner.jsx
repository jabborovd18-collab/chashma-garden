'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * QR SKANER
 * ════════════════════════════════════════════════════════════════
 * Ikki usulda o'qiydi:
 *
 *   1. BarcodeDetector — brauzerning o'z imkoniyati (Android Chrome).
 *      Tez va batareyani kam yeydi.
 *   2. jsQR — zaxira. iPhone Safari'da BarcodeDetector yo'q, shuning
 *      uchun kadrni canvas'ga chizib, piksellarni o'zimiz tahlil
 *      qilamiz.
 *
 * Kamera faqat `https` da ochiladi — bu brauzer qoidasi.
 *
 * Kod topilishi bilan kamera to'xtatiladi: skaner o'zi davomat
 * yozmaydi, balki topilgan matnni ota-komponentga beradi. Kimni
 * belgilayotganini hostes ko'rib tasdiqlaydi.
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react'
import { COLORS, UI } from '@/lib/constants'
import { cameraErrorMessage, cameraSupported } from '@/lib/qr'
import { Icon } from './icons'
import { Modal, Spinner, secondaryButtonStyle } from './ui'

export function QrScanner({ onScan, onClose, onManual }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const streamRef = useRef(null)
  const rafRef = useRef(0)
  const stoppedRef = useRef(false)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    stoppedRef.current = false
    let detector = null

    /** Kamerani va tahlil siklini to'xtatadi */
    function stop() {
      stoppedRef.current = true
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    /** Bitta kadrni tekshiradi, kod topilmasa keyingisini so'raydi */
    async function tick() {
      if (stoppedRef.current) return

      const video = videoRef.current
      // readyState >= 2 — kadr ma'lumoti mavjud
      if (video && video.readyState >= 2 && video.videoWidth) {
        let text = null

        if (detector) {
          try {
            const codes = await detector.detect(video)
            if (codes.length > 0) text = codes[0].rawValue
          } catch {
            // Ba'zi qurilmalarda detect vaqti-vaqti bilan yiqiladi —
            // keyingi kadrda qayta urinamiz
          }
        } else {
          const { videoWidth: w, videoHeight: h } = video
          const canvas = canvasRef.current
          canvas.width = w
          canvas.height = h

          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          ctx.drawImage(video, 0, 0, w, h)

          const { default: jsQR } = await import('jsqr')
          const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, {
            inversionAttempts: 'dontInvert',
          })
          if (found) text = found.data
        }

        if (text) {
          stop()
          onScanRef.current(text)
          return
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    async function start() {
      if (!cameraSupported()) {
        setError('Kamera faqat xavfsiz (https) ulanishda ishlaydi')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          // Telefonda orqa kamera qulayroq, bo'lmasa istalganini oladi
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })

        if (stoppedRef.current) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current
        video.srcObject = stream
        await video.play()
        setReady(true)

        if ('BarcodeDetector' in window) {
          try {
            detector = new window.BarcodeDetector({ formats: ['qr_code'] })
          } catch {
            detector = null // qo'llab-quvvatlanmasa jsQR ishlaydi
          }
        }

        tick()
      } catch (err) {
        setError(cameraErrorMessage(err))
      }
    }

    start()
    return stop
  }, [])

  return (
    <Modal title="QR skaner" onClose={onClose} width={420}>
      {error ? (
        <div style={{ textAlign: 'center', padding: '20px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: COLORS.danger }}>
            <Icon name="alert" size={30} strokeWidth={1.4} />
          </div>
          <p style={{ fontSize: 13.5, color: COLORS.text, marginTop: 14, lineHeight: 1.6 }}>
            {error}
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              background: '#000',
              borderRadius: UI.radius.control,
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              // iOS uchun shart: playsInline bo'lmasa video butun ekranga ochiladi
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Nishon ramkasi — xodim QR ni shu yerga tutadi */}
            <div
              style={{
                position: 'absolute',
                inset: '18%',
                border: `2px solid ${COLORS.white}`,
                borderRadius: 12,
                boxShadow: '0 0 0 100vmax rgba(0,0,0,0.35)',
                pointerEvents: 'none',
              }}
            />

            {!ready && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  color: COLORS.white,
                  fontSize: 13,
                }}
              >
                <Spinner size={22} color="#fff" />
                Kamera ochilmoqda
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <p
            style={{
              fontSize: 12.5,
              color: COLORS.textMuted,
              textAlign: 'center',
              marginTop: 14,
              lineHeight: 1.6,
            }}
          >
            Xodimning QR kodini ramka ichiga tuting.
            <br />
            Kod topilgach ismi chiqadi — tasdiqlaganingizdan keyin davomat yoziladi.
          </p>
        </>
      )}

      {onManual && (
        <button
          onClick={onManual}
          className="btn-secondary"
          style={secondaryButtonStyle({ width: '100%', marginTop: 16 })}
        >
          <Icon name="search" size={15} />
          Ro‘yxatdan qo‘lda tanlash
        </button>
      )}
    </Modal>
  )
}
