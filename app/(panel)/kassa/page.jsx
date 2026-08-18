'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * KASSA — PUL BERISH VA USHLANMALAR
 * ════════════════════════════════════════════════════════════════
 * Kassirning ish o'rni. Uch vazifasi bor:
 *
 *   1. Pul berish — kimga qancha tegishli, qanchasi berilgan,
 *      qanchasi qolgan. Har bir to'lov yozib boriladi.
 *   2. Jarima nazorati — kim qancha jarima to'lagani ko'rinadi.
 *   3. Zimmasiga yozish — singan idish, yo'qolgan jihoz, kam
 *      chiqqan kassa. Summa oylikdan ushlab qolinadi.
 *
 * Kassir davomatga ham, xodim kartotekasiga ham tegmaydi —
 * u faqat pul harakati bilan ishlaydi.
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/auth-context'
import { COLORS, UI } from '@/lib/constants'
import {
  monthKey,
  formatMonth,
  formatDate,
  formatSom,
  parseSom,
  dateKey,
  timeNow,
} from '@/lib/utils'
import { monthlyTotal, payoutState } from '@/lib/payroll'
import {
  loadWorkers,
  loadPositions,
  loadAttendanceByMonth,
  loadAdvancesByMonth,
  loadChargesByMonth,
  loadPayoutsByMonth,
  createCharge,
  deleteCharge,
  createPayout,
  deletePayout,
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
  FilterChips,
  IconButton,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  cardStyle,
} from '@/components/ui'

export default function KassaPage() {
  const { profile, isDirector } = useAuth()
  const { toast, showToast } = useToast()

  const [month, setMonth] = useState(() => monthKey())
  const [workers, setWorkers] = useState([])
  const [positions, setPositions] = useState([])
  const [records, setRecords] = useState([])
  const [advances, setAdvances] = useState([])
  const [charges, setCharges] = useState([])
  const [payouts, setPayouts] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [payFor, setPayFor] = useState(null)
  const [chargeFor, setChargeFor] = useState(null)
  const [detail, setDetail] = useState(null)

  const load = useCallback(async (mKey) => {
    setLoading(true)
    setError('')
    try {
      const [w, p, r, a, c, pay] = await Promise.all([
        loadWorkers(),
        loadPositions(),
        loadAttendanceByMonth(mKey),
        loadAdvancesByMonth(mKey),
        loadChargesByMonth(mKey),
        loadPayoutsByMonth(mKey),
      ])
      setWorkers(w)
      setPositions(p)
      setRecords(r)
      setAdvances(a)
      setCharges(c)
      setPayouts(pay)
    } catch (err) {
      setError(err.message || 'Kassa ma’lumotlarini yuklab bo‘lmadi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(month)
  }, [month, load])

  const posById = useMemo(() => new Map(positions.map((p) => [p.id, p])), [positions])

  /** Har bir xodim uchun: hisob, ushlanmalar, to'lovlar */
  const rows = useMemo(() => {
    const group = (list, key = 'workerId') => {
      const m = new Map()
      for (const x of list) {
        if (!m.has(x[key])) m.set(x[key], [])
        m.get(x[key]).push(x)
      }
      return m
    }

    const byRec = group(records)
    const byAdv = group(advances)
    const byChg = group(charges)
    const byPay = group(payouts)

    return workers
      .map((w) => {
        const recs = byRec.get(w.id) || []
        const advs = byAdv.get(w.id) || []
        const chgs = byChg.get(w.id) || []
        const pays = byPay.get(w.id) || []
        const totals = monthlyTotal(recs, advs, chgs)
        return {
          worker: w,
          position: posById.get(w.positionId),
          totals,
          charges: chgs,
          payouts: pays,
          state: payoutState(totals, pays),
        }
      })
      .filter((r) => r.totals.hisoblangan > 0 || r.state.berilgan > 0 || r.worker.active !== false)
      .sort((a, b) => b.state.qoldi - a.state.qoldi)
  }, [workers, records, advances, charges, payouts, posById])

  const filtered = useMemo(() => {
    if (filter === 'qarz') return rows.filter((r) => r.state.qoldi > 0)
    if (filter === 'tolangan') return rows.filter((r) => r.state.toliq && r.state.berilgan > 0)
    return rows
  }, [rows, filter])

  const grand = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          kerak: acc.kerak + r.state.kerak,
          berilgan: acc.berilgan + r.state.berilgan,
          qoldi: acc.qoldi + Math.max(0, r.state.qoldi),
          jarima: acc.jarima + r.totals.jarima,
          ushlanma: acc.ushlanma + r.totals.ushlanma,
        }),
        { kerak: 0, berilgan: 0, qoldi: 0, jarima: 0, ushlanma: 0 }
      ),
    [rows]
  )

  if (loading) return <SectionLoading label="Kassa hisobi tayyorlanmoqda" />

  return (
    <div className="animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <SectionHeader
        icon="banknote"
        title="Kassa"
        subtitle={`${formatMonth(month)} — to‘lovlar va ushlanmalar`}
        action={
          <input
            type="month"
            value={month}
            max={monthKey()}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            style={inputStyle({ width: 'auto' })}
          />
        }
      />

      {error && <ErrorBanner message={error} onRetry={() => load(month)} />}

      <StatGrid>
        <StatCard icon="wallet" label="Jami to‘lanadi" value={formatSom(grand.kerak)} sub="so‘m" />
        <StatCard
          icon="checkCircle"
          label="Berilgan"
          value={formatSom(grand.berilgan)}
          sub="so‘m"
          tone="success"
        />
        <StatCard
          icon="clock"
          label="Qolgan"
          value={formatSom(grand.qoldi)}
          sub="so‘m"
          tone={grand.qoldi ? 'warning' : undefined}
        />
        <StatCard
          icon="alert"
          label="Ushlanma"
          value={formatSom(grand.ushlanma)}
          sub="zimmaga yozilgan"
          tone={grand.ushlanma ? 'danger' : undefined}
        />
        <StatCard icon="percent" label="Jarimalar" value={formatSom(grand.jarima)} sub="so‘m" />
      </StatGrid>

      <div style={{ marginBottom: 16 }}>
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'all', label: 'Hammasi', count: rows.length },
            { id: 'qarz', label: 'To‘lanmagan', count: rows.filter((r) => r.state.qoldi > 0).length },
            {
              id: 'tolangan',
              label: 'To‘langan',
              count: rows.filter((r) => r.state.toliq && r.state.berilgan > 0).length,
            },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="wallet"
          title="Bu oyda hisob yo‘q"
          subtitle="Davomat belgilanmagan yoki xodimlar qo‘shilmagan"
        />
      ) : (
        <div style={cardStyle({ overflow: 'hidden' })}>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.zebra, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Th align="left">Xodim</Th>
                  <Th align="right">Jarima</Th>
                  <Th align="right">Ushlanma</Th>
                  <Th align="right">To‘lanadi</Th>
                  <Th align="right">Berilgan</Th>
                  <Th align="right">Qoldi</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
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

                    <Td align="right">
                      <span style={{ color: r.totals.jarima ? COLORS.danger : COLORS.textFaint }}>
                        {r.totals.jarima ? `−${formatSom(r.totals.jarima)}` : '—'}
                      </span>
                    </Td>

                    <Td align="right">
                      <span style={{ color: r.totals.ushlanma ? COLORS.danger : COLORS.textFaint }}>
                        {r.totals.ushlanma ? `−${formatSom(r.totals.ushlanma)}` : '—'}
                      </span>
                    </Td>

                    <Td align="right">
                      <strong>{formatSom(r.state.kerak)}</strong>
                    </Td>

                    <Td align="right">
                      <span style={{ color: r.state.berilgan ? COLORS.success : COLORS.textFaint }}>
                        {r.state.berilgan ? formatSom(r.state.berilgan) : '—'}
                      </span>
                    </Td>

                    <Td align="right">
                      {r.state.toliq ? (
                        <Badge icon="checkCircle" color={COLORS.success}>
                          to‘landi
                        </Badge>
                      ) : (
                        <strong style={{ color: COLORS.warning }}>
                          {formatSom(r.state.qoldi)}
                        </strong>
                      )}
                    </Td>

                    <Td>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setPayFor(r)}
                          disabled={r.state.qoldi <= 0}
                          className="btn-primary"
                          style={primaryButtonStyle({
                            minHeight: 30,
                            padding: '0 11px',
                            fontSize: 12.5,
                          })}
                        >
                          To‘lash
                        </button>
                        <IconButton
                          icon="alert"
                          title="Zimmasiga yozish"
                          size={30}
                          onClick={() => setChargeFor(r)}
                        />
                        <IconButton
                          icon="note"
                          title="Tafsilot"
                          size={30}
                          onClick={() => setDetail(r)}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}

                <tr style={{ background: COLORS.primarySoft, fontWeight: 600 }}>
                  <Td align="left">Jami — {filtered.length} xodim</Td>
                  <Td align="right" style={{ color: COLORS.danger }}>
                    −{formatSom(grand.jarima)}
                  </Td>
                  <Td align="right" style={{ color: COLORS.danger }}>
                    −{formatSom(grand.ushlanma)}
                  </Td>
                  <Td align="right">{formatSom(grand.kerak)}</Td>
                  <Td align="right" style={{ color: COLORS.success }}>
                    {formatSom(grand.berilgan)}
                  </Td>
                  <Td align="right" style={{ color: COLORS.warning }}>
                    {formatSom(grand.qoldi)}
                  </Td>
                  <Td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payFor && (
        <PayModal
          row={payFor}
          month={month}
          profile={profile}
          onClose={() => setPayFor(null)}
          onSaved={async (msg) => {
            setPayFor(null)
            showToast(msg)
            await load(month)
          }}
        />
      )}

      {chargeFor && (
        <ChargeModal
          row={chargeFor}
          profile={profile}
          onClose={() => setChargeFor(null)}
          onSaved={async (msg) => {
            setChargeFor(null)
            showToast(msg)
            await load(month)
          }}
        />
      )}

      {detail && (
        <DetailModal
          row={detail}
          month={month}
          canDelete={isDirector}
          onClose={() => setDetail(null)}
          onChanged={async (msg) => {
            showToast(msg)
            await load(month)
            setDetail(null)
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

function Td({ children, align = 'center', style }) {
  return (
    <td style={{ padding: '9px 12px', textAlign: align, whiteSpace: 'nowrap', ...style }}>
      {children}
    </td>
  )
}

/* ════════════════════════════════════════════════════════════════
   PUL BERISH
   ════════════════════════════════════════════════════════════════ */

function PayModal({ row, month, profile, onClose, onSaved }) {
  const [amount, setAmount] = useState(Math.max(0, row.state.qoldi))
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setError('')
    if (!amount || amount <= 0) return setError('Summani kiriting')

    setBusy(true)
    try {
      await createPayout({
        workerId: row.worker.id,
        workerName: row.worker.name,
        month,
        amount: Number(amount),
        note: note.trim() || null,
        date: dateKey(),
        time: timeNow(),
        createdBy: profile?.name || null,
        createdByUid: profile?.id || null,
      })
      await onSaved(`${row.worker.name} — ${formatSom(amount)} so‘m berildi`)
    } catch (err) {
      setError(err.message || 'Saqlab bo‘lmadi')
      setBusy(false)
    }
  }

  return (
    <Modal title={`To‘lov — ${row.worker.name}`} onClose={onClose} width={420}>
      <div
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: UI.radius.control,
          padding: 13,
          marginBottom: 16,
          fontSize: 12.5,
        }}
      >
        <Line label="Hisoblangan" value={formatSom(row.totals.hisoblangan)} />
        <Line label="Jarima" value={`−${formatSom(row.totals.jarima)}`} color={COLORS.danger} />
        <Line label="Avans" value={`−${formatSom(row.totals.avans)}`} color={COLORS.warning} />
        <Line label="Ushlanma" value={`−${formatSom(row.totals.ushlanma)}`} color={COLORS.danger} />
        <Line label="Avval berilgan" value={`−${formatSom(row.state.berilgan)}`} color={COLORS.success} />
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 8, paddingTop: 8 }}>
          <Line label="Berilishi kerak" value={`${formatSom(row.state.qoldi)} so‘m`} bold />
        </div>
      </div>

      <FormField label="Beriladigan summa (so‘m)">
        <input
          inputMode="numeric"
          value={formatSom(amount)}
          onChange={(e) => setAmount(parseSom(e.target.value))}
          style={inputStyle()}
        />
      </FormField>

      {amount > row.state.qoldi && (
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
          Kerakli summadan ko‘p berilyapti
        </div>
      )}

      <FormField label="Izoh">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Masalan: naqd berildi / avans o‘rniga"
          style={inputStyle()}
        />
      </FormField>

      <FormError message={error} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} disabled={busy} className="btn-secondary" style={secondaryButtonStyle({ flex: 1 })}>
          Bekor
        </button>
        <button onClick={save} disabled={busy} className="btn-primary" style={primaryButtonStyle({ flex: 1 })}>
          {busy ? <Spinner size={15} color="#fff" /> : 'To‘lovni yozish'}
        </button>
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════════════════════════
   ZIMMASIGA YOZISH
   ════════════════════════════════════════════════════════════════ */

function ChargeModal({ row, profile, onClose, onSaved }) {
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setError('')
    if (!amount || amount <= 0) return setError('Summani kiriting')
    if (reason.trim().length < 3) return setError('Sababini yozing')

    setBusy(true)
    try {
      await createCharge({
        workerId: row.worker.id,
        workerName: row.worker.name,
        amount: Number(amount),
        reason: reason.trim(),
        date: dateKey(),
        time: timeNow(),
        createdBy: profile?.name || null,
        createdByUid: profile?.id || null,
      })
      await onSaved(`${row.worker.name} zimmasiga ${formatSom(amount)} so‘m yozildi`)
    } catch (err) {
      setError(err.message || 'Saqlab bo‘lmadi')
      setBusy(false)
    }
  }

  return (
    <Modal title={`Zimmasiga yozish — ${row.worker.name}`} onClose={onClose} width={420}>
      <div
        style={{
          background: COLORS.warningSoft,
          border: `1px solid ${COLORS.warning}20`,
          color: COLORS.warning,
          borderRadius: UI.radius.control,
          padding: '11px 13px',
          fontSize: 12.5,
          lineHeight: 1.55,
          marginBottom: 16,
          display: 'flex',
          gap: 9,
        }}
      >
        <Icon name="info" size={15} />
        <span>
          Bu summa xodimning oyligidan ushlab qolinadi va u buni o‘z kabinetida sabab bilan
          ko‘radi. O‘chirish faqat direktorda.
        </span>
      </div>

      <FormField label="Summa (so‘m)">
        <input
          inputMode="numeric"
          value={formatSom(amount)}
          onChange={(e) => setAmount(parseSom(e.target.value))}
          style={inputStyle()}
        />
      </FormField>

      <FormField label="Sababi" hint="Aniq yozing — xodim shu matnni ko‘radi">
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Masalan: coca cola oldi / 3 ta tarelka sindirdi"
          style={inputStyle()}
        />
      </FormField>

      <FormError message={error} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} disabled={busy} className="btn-secondary" style={secondaryButtonStyle({ flex: 1 })}>
          Bekor
        </button>
        <button
          onClick={save}
          disabled={busy}
          className="btn-primary"
          style={primaryButtonStyle({ flex: 1, background: COLORS.danger })}
        >
          {busy ? <Spinner size={15} color="#fff" /> : 'Yozish'}
        </button>
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════════════════════════
   TAFSILOT
   ════════════════════════════════════════════════════════════════ */

function DetailModal({ row, month, canDelete, onClose, onChanged }) {
  const [busy, setBusy] = useState(false)

  async function removeCharge(id) {
    setBusy(true)
    try {
      await deleteCharge(id)
      await onChanged('Ushlanma o‘chirildi')
    } finally {
      setBusy(false)
    }
  }

  async function removePayout(id) {
    setBusy(true)
    try {
      await deletePayout(id)
      await onChanged('To‘lov yozuvi o‘chirildi')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={row.worker.name} onClose={onClose} width={520}>
      <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 16 }}>
        {formatMonth(month)}
      </div>

      <Caption>Ushlanmalar</Caption>
      {row.charges.length === 0 ? (
        <Muted>Zimmasiga hech narsa yozilmagan</Muted>
      ) : (
        <div style={{ marginBottom: 18 }}>
          {row.charges.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 2px',
                borderBottom: `1px solid ${COLORS.border}`,
                fontSize: 12.5,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div>{c.reason}</div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 2 }}>
                  {formatDate(c.date)}{c.time ? `, ${c.time}` : ''} · {c.createdBy}
                </div>
              </div>
              <strong style={{ color: COLORS.danger }}>−{formatSom(c.amount)}</strong>
              {canDelete && (
                <IconButton
                  icon="trash"
                  title="O‘chirish"
                  size={28}
                  color={COLORS.danger}
                  disabled={busy}
                  onClick={() => removeCharge(c.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <Caption>To‘lovlar</Caption>
      {row.payouts.length === 0 ? (
        <Muted>Hali pul berilmagan</Muted>
      ) : (
        row.payouts.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 2px',
              borderBottom: `1px solid ${COLORS.border}`,
              fontSize: 12.5,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div>{p.note || 'To‘lov'}</div>
              <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 2 }}>
                {formatDate(p.date)}{p.time ? `, ${p.time}` : ''} · {p.createdBy}
              </div>
            </div>
            <strong style={{ color: COLORS.success }}>{formatSom(p.amount)}</strong>
            {canDelete && (
              <IconButton
                icon="trash"
                title="O‘chirish"
                size={28}
                color={COLORS.danger}
                disabled={busy}
                onClick={() => removePayout(p.id)}
              />
            )}
          </div>
        ))
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
        <Line label="Hisoblangan" value={`${formatSom(row.totals.hisoblangan)} so‘m`} />
        <Line label="Jarima" value={`−${formatSom(row.totals.jarima)} so‘m`} color={COLORS.danger} />
        <Line label="Avans" value={`−${formatSom(row.totals.avans)} so‘m`} color={COLORS.warning} />
        <Line
          label="Ushlanma"
          value={`−${formatSom(row.totals.ushlanma)} so‘m`}
          color={COLORS.danger}
        />
        <Line
          label="Berilgan"
          value={`−${formatSom(row.state.berilgan)} so‘m`}
          color={COLORS.success}
        />
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 9, paddingTop: 9 }}>
          <Line label="Qoldi" value={`${formatSom(row.state.qoldi)} so‘m`} bold />
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
    <div style={{ color: COLORS.textFaint, fontSize: 12.5, padding: '6px 0 18px' }}>{children}</div>
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
