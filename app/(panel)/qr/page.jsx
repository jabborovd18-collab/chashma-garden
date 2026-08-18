'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * QR KARTALAR — CHOP ETISH
 * ════════════════════════════════════════════════════════════════
 * Telefoni yo'q yoki kabinetga kirmaydigan xodimlar uchun: barcha
 * QR kodlar bitta varaqqa chiqariladi, kesib kartochka qilinadi.
 *
 * Chop etishda faqat kartalar chiqadi — sarlavha, tugma va panel
 * navigatsiyasi `no-print` sinfi bilan yashiriladi.
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/auth-context'
import { COLORS, UI } from '@/lib/constants'
import { loadWorkers, loadPositions } from '@/lib/db'
import { errorMessage } from '@/lib/auth-errors'
import { Icon, resolveIconName } from '@/components/icons'
import { QrCode } from '@/components/qr'
import { workerQrValue } from '@/lib/qr'
import {
  SectionHeader,
  SectionLoading,
  ErrorBanner,
  InfoBanner,
  EmptyState,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from '@/components/ui'

export default function QrPage() {
  const { role } = useAuth()
  const canView = role === 'director' || role === 'admin'

  const [workers, setWorkers] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterPos, setFilterPos] = useState('all')

  const load = useCallback(async () => {
    setError('')
    try {
      const [w, p] = await Promise.all([loadWorkers(), loadPositions()])
      setWorkers(w.filter((x) => x.active !== false))
      setPositions(p)
    } catch (err) {
      setError(errorMessage(err, 'Xodimlarni yuklab bo‘lmadi'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (canView) load()
    else setLoading(false)
  }, [canView, load])

  const posById = useMemo(() => new Map(positions.map((p) => [p.id, p])), [positions])

  const filtered = useMemo(
    () => (filterPos === 'all' ? workers : workers.filter((w) => w.positionId === filterPos)),
    [workers, filterPos]
  )

  if (!canView) {
    return (
      <EmptyState
        icon="lock"
        title="Ruxsat yo‘q"
        subtitle="QR kartalarni faqat direktor va administrator chiqaradi"
      />
    )
  }

  if (loading) return <SectionLoading />

  return (
    <div className="animate-fadeIn">
      <div className="no-print">
        <SectionHeader
          icon="qr"
          title="QR kartalar"
          subtitle={`${filtered.length} ta karta — kesib xodimlarga tarqating`}
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={filterPos}
                onChange={(e) => setFilterPos(e.target.value)}
                style={inputStyle({ width: 'auto' })}
              >
                <option value="all">Barcha lavozimlar</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={primaryButtonStyle()}
              >
                <Icon name="printer" size={15} />
                Chop etish
              </button>
            </div>
          }
        />

        {error && <ErrorBanner message={error} onRetry={load} />}

        <InfoBanner>
          Telefoni bor xodimlar QR kodini o‘z kabinetida ko‘radi — ularga karta shart emas.
          Kartani qattiq qog‘ozga chiqarib, kesib bering. Kod yo‘qolsa yangisini shu yerdan
          qayta chiqarasiz — kod o‘zgarmaydi.
        </InfoBanner>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="users"
          title="Xodim yo‘q"
          subtitle="Avval «Xodimlar» bo‘limida ishchilarni qo‘shing"
        />
      ) : (
        <div className="qr-grid">
          {filtered.map((w) => {
            const p = posById.get(w.positionId)
            return (
              <div key={w.id} className="qr-card">
                <QrCode value={workerQrValue(w.id)} size={140} />

                <div style={{ marginTop: 8, textAlign: 'center', minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: '#000',
                    }}
                  >
                    {w.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#555',
                      marginTop: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Icon name={resolveIconName(p?.icon)} size={11} />
                    {p?.name || '—'}
                  </div>
                  <div style={{ fontSize: 9, color: '#999', marginTop: 4, letterSpacing: '0.04em' }}>
                    CHASHMA GARDEN
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 12px;
        }
        .qr-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 10px;
          background: #fff;
          border: 1px solid ${COLORS.border};
          border-radius: ${UI.radius.card}px;
          break-inside: avoid;
        }

        @media print {
          @page { margin: 10mm; }
          .qr-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 6mm;
          }
          .qr-card {
            border: 1px dashed #999;
            border-radius: 0;
            padding: 6mm 3mm;
          }
        }
      `}</style>
    </div>
  )
}
