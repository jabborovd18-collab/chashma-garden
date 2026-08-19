'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * OYLIK HISOBOT
 * ════════════════════════════════════════════════════════════════
 * Har bir xodim uchun oylik yakun:
 *   hisoblangan = Σ kelgan kunlar × o'sha kundagi stavka
 *   yakuniy     = hisoblangan − jarimalar − avanslar
 *
 * Hisob davomat yozuvlaridagi saqlangan qiymatlardan olinadi —
 * xodimning hozirgi stavkasidan emas. Shu sababli stavka o'zgarsa
 * ham o'tgan oylarning hisoboti buzilmaydi.
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/auth-context'
import { COLORS, STATUS, UI } from '@/lib/constants'
import {
  monthKey,
  formatMonth,
  formatSom,
  formatDate,
  formatDuration,
  dateKey,
  parseSom,
} from '@/lib/utils'
import { monthlyTotal } from '@/lib/payroll'
import {
  loadWorkers,
  loadPositions,
  loadAttendanceByMonth,
  loadAdvancesByMonth,
  loadChargesByMonth,
  createAdvance,
  deleteAdvance,
} from '@/lib/db'
import { Icon, resolveIconName } from '@/components/icons'
import {
  SectionHeader,
  SectionLoading,
  ErrorBanner,
  EmptyState,
  StatCard,
  StatGrid,
  Badge,
  Avatar,
  Modal,
  Toast,
  useToast,
  Spinner,
  FormField,
  FormError,
  IconButton,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  cardStyle,
} from '@/components/ui'
import { errorMessage } from '@/lib/auth-errors'

export default function HisobotPage() {
  // Avansni o‘chirish to‘lanadigan summani oshiradi — bu amal
  // faqat direktorda (firestore.rules ham shuni talab qiladi)
  const { isDirector } = useAuth()
  const { toast, showToast } = useToast()

  const [month, setMonth] = useState(() => monthKey())
  const [workers, setWorkers] = useState([])
  const [positions, setPositions] = useState([])
  const [records, setRecords] = useState([])
  const [advances, setAdvances] = useState([])
  const [charges, setCharges] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [advanceFor, setAdvanceFor] = useState(null)

  const load = useCallback(async (mKey) => {
    setLoading(true)
    setError('')
    try {
      const [w, p, r, a, c] = await Promise.all([
        loadWorkers(),
        loadPositions(),
        loadAttendanceByMonth(mKey),
        loadAdvancesByMonth(mKey),
        loadChargesByMonth(mKey),
      ])
      setWorkers(w)
      setPositions(p)
      setRecords(r)
      setAdvances(a)
      setCharges(c)
    } catch (err) {
      setError(errorMessage(err, 'Hisobotni yuklab bo‘lmadi'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(month)
  }, [month, load])

  const posById = useMemo(() => new Map(positions.map((p) => [p.id, p])), [positions])

  const rows = useMemo(() => {
    const byWorker = new Map()
    for (const r of records) {
      if (!byWorker.has(r.workerId)) byWorker.set(r.workerId, [])
      byWorker.get(r.workerId).push(r)
    }

    const advByWorker = new Map()
    for (const a of advances) {
      if (!advByWorker.has(a.workerId)) advByWorker.set(a.workerId, [])
      advByWorker.get(a.workerId).push(a)
    }

    const chgByWorker = new Map()
    for (const c of charges) {
      if (!chgByWorker.has(c.workerId)) chgByWorker.set(c.workerId, [])
      chgByWorker.get(c.workerId).push(c)
    }

    return workers
      .map((w) => {
        const recs = byWorker.get(w.id) || []
        const advs = advByWorker.get(w.id) || []
        const chgs = chgByWorker.get(w.id) || []
        return {
          worker: w,
          position: posById.get(w.positionId),
          records: recs.sort((a, b) => a.date.localeCompare(b.date)),
          advances: advs,
          charges: chgs,
          totals: monthlyTotal(recs, advs, chgs),
        }
      })
      .filter((r) => r.records.length > 0 || r.advances.length > 0 || r.worker.active !== false)
      .sort((a, b) => b.totals.yakuniy - a.totals.yakuniy)
  }, [workers, records, advances, charges, posById])

  const grand = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          hisoblangan: acc.hisoblangan + r.totals.hisoblangan,
          jarima: acc.jarima + r.totals.jarima,
          avans: acc.avans + r.totals.avans,
          ushlanma: acc.ushlanma + r.totals.ushlanma,
          yakuniy: acc.yakuniy + r.totals.yakuniy,
          ishlagan: acc.ishlagan + r.totals.ishlagan,
          kechikkan: acc.kechikkan + r.totals.kechikkan,
        }),
        { hisoblangan: 0, jarima: 0, avans: 0, ushlanma: 0, yakuniy: 0, ishlagan: 0, kechikkan: 0 }
      ),
    [rows]
  )

  if (loading) return <SectionLoading label="Hisobot tayyorlanmoqda" />

  return (
    <div className="animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <SectionHeader
        icon="wallet"
        title="Oylik hisobot"
        subtitle={formatMonth(month)}
        action={
          <div style={{ display: 'flex', gap: 8 }} className="no-print">
            <input
              type="month"
              value={month}
              max={monthKey()}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              style={inputStyle({ width: 'auto' })}
            />
            <button
              onClick={() => window.print()}
              title="Chop etish"
              className="btn-secondary"
              style={secondaryButtonStyle({ padding: '0 11px' })}
            >
              <Icon name="printer" size={15} />
            </button>
          </div>
        }
      />

      {error && <ErrorBanner message={error} onRetry={() => load(month)} />}

      <StatGrid>
        <StatCard icon="chart" label="Hisoblangan" value={formatSom(grand.hisoblangan)} sub="so‘m, jarimasiz" />
        <StatCard
          icon="clock"
          label="Jarimalar"
          value={formatSom(grand.jarima)}
          sub={`${grand.kechikkan} ta kechikish`}
          tone={grand.jarima ? 'danger' : undefined}
        />
        <StatCard
          icon="coins"
          label="Avanslar"
          value={formatSom(grand.avans)}
          sub="so‘m"
          tone={grand.avans ? 'warning' : undefined}
        />
        <StatCard icon="banknote" label="To‘lanadi" value={formatSom(grand.yakuniy)} sub="so‘m" />
      </StatGrid>

      {rows.length === 0 ? (
        <EmptyState
          icon="calendarDays"
          title="Bu oyda ma’lumot yo‘q"
          subtitle="Davomat belgilanmagan yoki xodimlar qo‘shilmagan"
        />
      ) : (
        <div style={cardStyle({ overflow: 'hidden' })}>
          <div className="table-wrap">
            <table className="table-cards" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.zebra, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Th align="left">Xodim</Th>
                  <Th>Ishlagan</Th>
                  <Th>Kechikish</Th>
                  <Th align="right">Hisoblangan</Th>
                  <Th align="right">Jarima</Th>
                  <Th align="right">Avans</Th>
                  <Th align="right">Ushlanma</Th>
                  <Th align="right">To‘lanadi</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.worker.id}
                    className="row-hover"
                    style={{ borderBottom: `1px solid ${COLORS.border}` }}
                  >
                    <Td align="left">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={r.worker.name} size={30} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500 }}>{r.worker.name}</div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: COLORS.textMuted,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: 1,
                            }}
                          >
                            <Icon name={resolveIconName(r.position?.icon)} size={11} />
                            {r.position?.name || '—'}
                          </div>
                        </div>
                      </div>
                    </Td>

                    <Td label="Ishlagan">
                      <strong>{r.totals.ishlagan}</strong>
                      <span style={{ color: COLORS.textMuted }}> kun</span>
                    </Td>

                    <Td label="Kechikish">
                      {r.totals.kechikkan > 0 ? (
                        <Badge icon="clock" color={COLORS.warning}>
                          {r.totals.kechikkan}× · {formatDuration(r.totals.kechikishDaq)}
                        </Badge>
                      ) : (
                        <span style={{ color: COLORS.textFaint }}>—</span>
                      )}
                    </Td>

                    <Td label="Hisoblangan" align="right">{formatSom(r.totals.hisoblangan)}</Td>

                    <Td label="Jarima" align="right">
                      <span style={{ color: r.totals.jarima ? COLORS.danger : COLORS.textFaint }}>
                        {r.totals.jarima ? `−${formatSom(r.totals.jarima)}` : '—'}
                      </span>
                    </Td>

                    <Td label="Avans" align="right">
                      <span style={{ color: r.totals.avans ? COLORS.warning : COLORS.textFaint }}>
                        {r.totals.avans ? `−${formatSom(r.totals.avans)}` : '—'}
                      </span>
                    </Td>

                    <Td label="Ushlanma" align="right">
                      <span style={{ color: r.totals.ushlanma ? COLORS.danger : COLORS.textFaint }}>
                        {r.totals.ushlanma ? `−${formatSom(r.totals.ushlanma)}` : '—'}
                      </span>
                    </Td>

                    <Td label="To‘lanadi" align="right">
                      <strong style={{ fontSize: 13.5 }}>{formatSom(r.totals.yakuniy)}</strong>
                    </Td>

                    <Td>
                      <div style={{ display: 'flex', gap: 5 }} className="no-print">
                        <IconButton
                          icon="calendarDays"
                          title="Kunlar bo‘yicha"
                          size={28}
                          onClick={() => setDetail(r)}
                        />
                        <IconButton
                          icon="coins"
                          title="Avans berish"
                          size={28}
                          onClick={() => setAdvanceFor(r)}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}

                <tr style={{ background: COLORS.primarySoft, fontWeight: 600 }}>
                  <Td align="left">Jami — {rows.length} xodim</Td>
                  <Td label="Ishlagan">{grand.ishlagan}</Td>
                  <Td label="Kechikish">{grand.kechikkan}×</Td>
                  <Td label="Hisoblangan" align="right">{formatSom(grand.hisoblangan)}</Td>
                  <Td label="Jarima" align="right" style={{ color: COLORS.danger }}>
                    −{formatSom(grand.jarima)}
                  </Td>
                  <Td label="Avans" align="right" style={{ color: COLORS.warning }}>
                    −{formatSom(grand.avans)}
                  </Td>
                  <Td label="Ushlanma" align="right" style={{ color: COLORS.danger }}>
                    −{formatSom(grand.ushlanma)}
                  </Td>
                  <Td label="To‘lanadi" align="right" style={{ fontSize: 14 }}>
                    {formatSom(grand.yakuniy)}
                  </Td>
                  <Td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && (
        <DetailModal
          row={detail}
          month={month}
          onClose={() => setDetail(null)}
          canDeleteAdvance={isDirector}
          onDeleteAdvance={async (id) => {
            await deleteAdvance(id)
            await load(month)
            showToast('Avans o‘chirildi')
          }}
        />
      )}

      {advanceFor && (
        <AdvanceModal
          row={advanceFor}
          onClose={() => setAdvanceFor(null)}
          onSave={async (amount, note) => {
            await createAdvance({ workerId: advanceFor.worker.id, amount, note, date: dateKey() })
            await load(month)
            showToast('Avans qo‘shildi')
            setAdvanceFor(null)
          }}
        />
      )}
    </div>
  )
}

/* ─── Jadval kataklari ────────────────────────────────────────── */

function Th({ children, align = 'center' }) {
  return (
    <th
      style={{
        padding: '10px 12px',
        textAlign: align,
        fontSize: 11.5,
        fontWeight: 600,
        color: COLORS.textMuted,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, align = 'center', style, label }) {
  // data-label — telefonda ustun nomi qiymat yonida chiqadi
  // (globals.css dagi .table-cards qoidalariga qarang)
  return (
    <td
      data-label={label}
      style={{ padding: '9px 12px', textAlign: align, whiteSpace: 'nowrap', ...style }}
    >
      {children}
    </td>
  )
}

/* ════════════════════════════════════════════════════════════════
   KUNLAR BO'YICHA TAFSILOT
   ════════════════════════════════════════════════════════════════ */

function DetailModal({ row, month, onClose, onDeleteAdvance, canDeleteAdvance }) {
  const { worker, records, advances, charges = [], totals } = row

  return (
    <Modal title={worker.name} onClose={onClose} width={620}>
      <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 16 }}>
        {formatMonth(month)} · {row.position?.name || 'Lavozimsiz'}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
          gap: 8,
          marginBottom: 20,
        }}
      >
        <MiniStat label="Ishlagan" value={totals.ishlagan} />
        <MiniStat label="Kechikkan" value={totals.kechikkan} color={COLORS.warning} />
        <MiniStat label="Kelmagan" value={totals.kelmagan} color={COLORS.danger} />
        <MiniStat label="Dam" value={totals.dam} />
      </div>

      <Caption>Kunlar</Caption>
      {records.length === 0 ? (
        <Muted>Yozuv yo‘q</Muted>
      ) : (
        <div
          style={{
            maxHeight: 260,
            overflowY: 'auto',
            border: `1px solid ${COLORS.border}`,
            borderRadius: UI.radius.control,
            marginBottom: 20,
          }}
        >
          {records.map((r, i) => {
            const st = STATUS[r.status]
            return (
              <div
                key={r.date}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 11px',
                  borderBottom: i === records.length - 1 ? 'none' : `1px solid ${COLORS.border}`,
                  fontSize: 12.5,
                }}
              >
                <span style={{ width: 104, color: COLORS.textMuted }}>{formatDate(r.date)}</span>
                <Badge icon={st?.icon} color={st?.color}>
                  {st?.label}
                </Badge>
                <span style={{ width: 42, fontWeight: 600 }}>{r.checkIn || '—'}</span>
                <span style={{ flex: 1, color: COLORS.warning }}>
                  {r.late > 0 ? formatDuration(r.late) : ''}
                </span>
                {r.penalty > 0 && (
                  <span style={{ color: COLORS.danger }}>−{formatSom(r.penalty)}</span>
                )}
                <span style={{ width: 74, textAlign: 'right', fontWeight: 600 }}>
                  {formatSom(r.earned || 0)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <Caption>Avanslar</Caption>
      {advances.length === 0 ? (
        <Muted>Avans olinmagan</Muted>
      ) : (
        <div style={{ marginBottom: 8 }}>
          {advances.map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 2px',
                borderBottom: `1px solid ${COLORS.border}`,
                fontSize: 12.5,
              }}
            >
              <span style={{ color: COLORS.textMuted, width: 104 }}>{formatDate(a.date)}</span>
              <span style={{ flex: 1 }}>{a.note || '—'}</span>
              <strong style={{ color: COLORS.warning }}>−{formatSom(a.amount)}</strong>
              {canDeleteAdvance && (
                <IconButton
                  icon="trash"
                  title="O‘chirish"
                  size={28}
                  color={COLORS.danger}
                  onClick={() => onDeleteAdvance(a.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {charges.length > 0 && (
        <>
          <Caption>Ushlanmalar</Caption>
          <div style={{ marginBottom: 8 }}>
            {charges.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 2px',
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: COLORS.textMuted, width: 104 }}>{formatDate(c.date)}</span>
                <span style={{ flex: 1 }}>{c.reason}</span>
                <strong style={{ color: COLORS.danger }}>−{formatSom(c.amount)}</strong>
              </div>
            ))}
          </div>
        </>
      )}

      <div
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: UI.radius.control,
          padding: 14,
          marginTop: 18,
          fontSize: 13,
        }}
      >
        <Line label="Hisoblangan" value={`${formatSom(totals.hisoblangan)} so‘m`} />
        <Line label="Jarimalar" value={`−${formatSom(totals.jarima)} so‘m`} color={COLORS.danger} />
        <Line label="Avanslar" value={`−${formatSom(totals.avans)} so‘m`} color={COLORS.warning} />
        <Line
          label="Ushlanmalar"
          value={`−${formatSom(totals.ushlanma)} so‘m`}
          color={COLORS.danger}
        />
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 9, paddingTop: 9 }}>
          <Line label="To‘lanadi" value={`${formatSom(totals.yakuniy)} so‘m`} bold />
        </div>
      </div>
    </Modal>
  )
}

function Caption({ children }) {
  return (
    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: COLORS.textMuted }}>
      {children}
    </div>
  )
}

function Muted({ children }) {
  return (
    <div style={{ color: COLORS.textFaint, fontSize: 12.5, padding: '8px 0 18px' }}>{children}</div>
  )
}

function Line({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0' }}>
      <span style={{ color: COLORS.textMuted, fontWeight: bold ? 600 : 400 }}>{label}</span>
      <strong style={{ color: color || COLORS.text, fontSize: bold ? 15 : 13 }}>{value}</strong>
    </div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div
      style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: UI.radius.control,
        padding: 10,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: color || COLORS.text, marginTop: 2 }}>
        {value}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   AVANS
   ════════════════════════════════════════════════════════════════ */

function AdvanceModal({ row, onClose, onSave }) {
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const qoladi = row.totals.yakuniy

  async function save() {
    if (!amount || amount <= 0) return setError('Summani kiriting')
    setBusy(true)
    try {
      await onSave(amount, note.trim())
    } catch (err) {
      setError(errorMessage(err, 'Saqlab bo‘lmadi'))
      setBusy(false)
    }
  }

  return (
    <Modal title={`Avans — ${row.worker.name}`} onClose={onClose} width={420}>
      <div
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: UI.radius.control,
          padding: 12,
          fontSize: 12.5,
          marginBottom: 16,
          color: COLORS.textMuted,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Shu oyda to‘lanishi kerak</span>
        <strong style={{ color: COLORS.text }}>{formatSom(qoladi)} so‘m</strong>
      </div>

      <FormField label="Avans summasi (so‘m)">
        <input
          inputMode="numeric"
          value={formatSom(amount)}
          onChange={(e) => setAmount(parseSom(e.target.value))}
          style={inputStyle()}
        />
      </FormField>

      {amount > qoladi && qoladi > 0 && (
        <div
          style={{
            fontSize: 12,
            color: COLORS.warning,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <Icon name="alert" size={14} />
          Avans qolgan summadan ko‘p — xodim oy oxirida qarzdor bo‘lib qoladi
        </div>
      )}

      <FormField label="Izoh">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Masalan: oldindan so‘radi"
          style={inputStyle()}
        />
      </FormField>

      <FormError message={error} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onClose}
          disabled={busy}
          className="btn-secondary"
          style={secondaryButtonStyle({ flex: 1 })}
        >
          Bekor
        </button>
        <button
          onClick={save}
          disabled={busy}
          className="btn-primary"
          style={primaryButtonStyle({ flex: 1 })}
        >
          {busy ? <Spinner size={15} color="#fff" /> : 'Avansni yozish'}
        </button>
      </div>
    </Modal>
  )
}
