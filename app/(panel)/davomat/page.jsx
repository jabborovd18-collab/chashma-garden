'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * DAVOMAT — KUNLIK KELISH BELGILASH
 * ════════════════════════════════════════════════════════════════
 * Hostes yoki administrator xodim kelganda «Keldi» tugmasini bosadi.
 * Kelgan vaqt Toshkent soati bo'yicha yoziladi, kechikish va jarima
 * lib/payroll.js dagi qoidalar asosida darhol hisoblanadi.
 *
 * Hisoblangan qiymatlar (stavka, kechikish, jarima) yozuvning ichiga
 * ko'chirib saqlanadi. Sababi: keyinchalik stavka yoki jarima qoidasi
 * o'zgarsa, o'tgan oylarning hisoboti o'zgarmasligi kerak.
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/auth-context'
import { COLORS, STATUS, MANUAL_STATUSES, UI } from '@/lib/constants'
import {
  dateKey,
  timeNow,
  formatDate,
  weekdayName,
  shiftDate,
  formatSom,
  formatDuration,
} from '@/lib/utils'
import { calcDay, withDefaults } from '@/lib/payroll'
import {
  loadSettings,
  loadPositions,
  loadWorkers,
  loadAttendanceByDate,
  saveAttendance,
  removeAttendance,
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
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  cardStyle,
} from '@/components/ui'
import { errorMessage } from '@/lib/auth-errors'

export default function DavomatPage() {
  const { profile } = useAuth()
  const { toast, showToast } = useToast()

  const [selectedDate, setSelectedDate] = useState(() => dateKey())
  const [workers, setWorkers] = useState([])
  const [positions, setPositions] = useState([])
  const [settings, setSettings] = useState(null)
  const [records, setRecords] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [editing, setEditing] = useState(null)

  const isToday = selectedDate === dateKey()

  /* ─── Yuklash ────────────────────────────────────────────────── */

  const loadBase = useCallback(async () => {
    const [s, p, w] = await Promise.all([loadSettings(), loadPositions(), loadWorkers()])
    setSettings(withDefaults(s))
    setPositions(p)
    setWorkers(w.filter((x) => x.active !== false))
  }, [])

  const loadDay = useCallback(async (dKey) => {
    const list = await loadAttendanceByDate(dKey)
    setRecords(Object.fromEntries(list.map((r) => [r.workerId, r])))
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        await loadBase()
        if (alive) await loadDay(selectedDate)
      } catch (err) {
        if (alive) setError(errorMessage(err, 'Ma’lumotlarni yuklab bo‘lmadi'))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (loading) return
    let alive = true
    ;(async () => {
      try {
        if (alive) await loadDay(selectedDate)
      } catch (err) {
        if (alive) setError(errorMessage(err, 'Kun ma’lumotini o‘qib bo‘lmadi'))
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  /* ─── Yordamchilar ──────────────────────────────────────────── */

  const posById = useMemo(() => new Map(positions.map((p) => [p.id, p])), [positions])

  const shiftStartFor = useCallback(
    (worker) =>
      worker.shiftStart || posById.get(worker.positionId)?.shiftStart || settings?.defaultShiftStart,
    [posById, settings]
  )

  /* ─── Yozish ─────────────────────────────────────────────────── */

  async function mark(worker, { status = 'keldi', checkIn = null } = {}) {
    if (!settings) return
    setSavingId(worker.id)

    try {
      const time = status === 'keldi' ? checkIn || timeNow() : null
      const rate = Number(worker.dailyRate) || 0
      const start = shiftStartFor(worker)

      const calc = calcDay({ status, checkIn: time, shiftStart: start, dailyRate: rate, settings })

      const payload = {
        workerId: worker.id,
        workerName: worker.name,
        positionId: worker.positionId || null,
        positionName: posById.get(worker.positionId)?.name || null,
        shiftStart: start,
        checkIn: time,
        dailyRate: rate,
        status: calc.status,
        late: calc.late,
        penalty: calc.penalty,
        earned: calc.earned,
        markedBy: profile?.name || null,
        markedByUid: profile?.id || null,
      }

      await saveAttendance(selectedDate, worker.id, payload)
      setRecords((prev) => ({ ...prev, [worker.id]: payload }))

      const label = STATUS[calc.status]?.label || calc.status
      showToast(
        calc.penalty > 0
          ? `${worker.name} — ${label}, jarima ${formatSom(calc.penalty)} so‘m`
          : `${worker.name} — ${label}`,
        calc.penalty > 0 ? 'info' : 'success'
      )
    } catch (err) {
      showToast(errorMessage(err, 'Saqlab bo‘lmadi'), 'error')
    } finally {
      setSavingId(null)
    }
  }

  async function clearMark(worker) {
    setSavingId(worker.id)
    try {
      await removeAttendance(selectedDate, worker.id)
      setRecords((prev) => {
        const next = { ...prev }
        delete next[worker.id]
        return next
      })
      showToast(`${worker.name} — belgi olib tashlandi`, 'info')
    } catch (err) {
      showToast(errorMessage(err, 'O‘chirib bo‘lmadi'), 'error')
    } finally {
      setSavingId(null)
    }
  }

  /* ─── Filtr va guruhlash ────────────────────────────────────── */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return workers
    return workers.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        posById.get(w.positionId)?.name?.toLowerCase().includes(q)
    )
  }, [workers, search, posById])

  const groups = useMemo(() => {
    const map = new Map()
    for (const w of filtered) {
      const key = w.positionId || '_boshqa'
      if (!map.has(key)) {
        const p = posById.get(w.positionId)
        map.set(key, {
          key,
          name: p?.name || 'Lavozimsiz',
          icon: resolveIconName(p?.icon),
          order: p?.order ?? 99,
          workers: [],
        })
      }
      map.get(key).workers.push(w)
    }
    return [...map.values()].sort((a, b) => a.order - b.order)
  }, [filtered, posById])

  const stats = useMemo(() => {
    const all = Object.values(records)
    const kelgan = all.filter((r) => r.status === 'keldi' || r.status === 'kech').length
    return {
      jami: workers.length,
      kelgan,
      kechikkan: all.filter((r) => r.status === 'kech').length,
      kelmagan: all.filter((r) => r.status === 'kelmadi').length,
      belgilanmagan: workers.length - all.length,
      jarima: all.reduce((s, r) => s + (Number(r.penalty) || 0), 0),
    }
  }, [records, workers])

  if (loading) return <SectionLoading />

  return (
    <div className="animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <SectionHeader
        icon="attendance"
        title="Davomat"
        subtitle={`${formatDate(selectedDate)}, ${weekdayName(selectedDate)}${isToday ? ' — bugun' : ''}`}
        action={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
              aria-label="Oldingi kun"
              style={secondaryButtonStyle({ padding: '0 10px' })}
            >
              <Icon name="chevronLeft" size={15} />
            </button>

            <input
              type="date"
              value={selectedDate}
              max={dateKey()}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              style={inputStyle({ width: 'auto' })}
            />

            <button
              onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
              disabled={isToday}
              aria-label="Keyingi kun"
              style={secondaryButtonStyle({ padding: '0 10px' })}
            >
              <Icon name="chevronRight" size={15} />
            </button>

            {!isToday && (
              <button onClick={() => setSelectedDate(dateKey())} style={secondaryButtonStyle()}>
                Bugun
              </button>
            )}
          </div>
        }
      />

      {error && <ErrorBanner message={error} onRetry={() => window.location.reload()} />}

      <StatGrid min={140}>
        <StatCard icon="checkCircle" label="Keldi" value={`${stats.kelgan}/${stats.jami}`} />
        <StatCard
          icon="clock"
          label="Kechikdi"
          value={stats.kechikkan}
          tone={stats.kechikkan ? 'warning' : undefined}
        />
        <StatCard
          icon="xCircle"
          label="Kelmadi"
          value={stats.kelmagan}
          tone={stats.kelmagan ? 'danger' : undefined}
        />
        <StatCard icon="circleDashed" label="Belgilanmagan" value={stats.belgilanmagan} />
        <StatCard
          icon="banknote"
          label="Kunlik jarima"
          value={formatSom(stats.jarima)}
          sub="so‘m"
          tone={stats.jarima ? 'danger' : undefined}
        />
      </StatGrid>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span
          style={{
            position: 'absolute',
            left: 11,
            top: '50%',
            transform: 'translateY(-50%)',
            color: COLORS.textFaint,
          }}
        >
          <Icon name="search" size={15} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Xodim yoki lavozim bo‘yicha qidirish"
          style={inputStyle({ paddingLeft: 34 })}
        />
      </div>

      {workers.length === 0 ? (
        <EmptyState
          icon="users"
          title="Xodimlar ro‘yxati bo‘sh"
          subtitle="Avval «Xodimlar» bo‘limida ishchilarni qo‘shing"
        />
      ) : groups.length === 0 ? (
        <EmptyState icon="search" title="Hech narsa topilmadi" subtitle="Boshqa so‘z bilan qidiring" />
      ) : (
        groups.map((g) => {
          const kelgan = g.workers.filter((w) => STATUS[records[w.id]?.status]?.paid).length
          return (
            <div key={g.key} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  margin: '0 2px 7px',
                  color: COLORS.textMuted,
                }}
              >
                <Icon name={g.icon} size={15} />
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{g.name}</span>
                <span style={{ fontSize: 12 }}>
                  {kelgan}/{g.workers.length}
                </span>
              </div>

              <div style={cardStyle({ overflow: 'hidden' })}>
                {g.workers.map((w, i) => (
                  <WorkerRow
                    key={w.id}
                    worker={w}
                    record={records[w.id]}
                    shiftStart={shiftStartFor(w)}
                    busy={savingId === w.id}
                    isLast={i === g.workers.length - 1}
                    onMark={() => mark(w)}
                    onOpen={() => setEditing(w)}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}

      {editing && (
        <EditModal
          worker={editing}
          record={records[editing.id]}
          shiftStart={shiftStartFor(editing)}
          settings={settings}
          onClose={() => setEditing(null)}
          onSave={async (opts) => {
            await mark(editing, opts)
            setEditing(null)
          }}
          onClear={async () => {
            await clearMark(editing)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   XODIM QATORI
   ════════════════════════════════════════════════════════════════ */

function WorkerRow({ worker, record, shiftStart, busy, isLast, onMark, onOpen }) {
  const st = record ? STATUS[record.status] : null

  return (
    <div
      className="row-hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 13px',
        borderBottom: isLast ? 'none' : `1px solid ${COLORS.border}`,
      }}
    >
      <Avatar name={worker.name} size={32} color={st?.color || COLORS.textMuted} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="truncate" style={{ fontSize: 13.5, fontWeight: 500, color: COLORS.text }}>
          {worker.name}
        </div>

        <div
          style={{
            fontSize: 11.5,
            color: COLORS.textMuted,
            marginTop: 2,
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={12} />
            {shiftStart}
          </span>
          <span>{formatSom(worker.dailyRate)} so‘m</span>
          {record?.late > 0 && (
            <span style={{ color: COLORS.warning, fontWeight: 600 }}>
              +{formatDuration(record.late)}
            </span>
          )}
          {record?.penalty > 0 && (
            <span style={{ color: COLORS.danger, fontWeight: 600 }}>
              −{formatSom(record.penalty)}
            </span>
          )}
        </div>
      </div>

      {busy ? (
        <Spinner size={18} />
      ) : record ? (
        <button
          onClick={onOpen}
          style={{
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 0,
          }}
        >
          {record.checkIn && (
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
              {record.checkIn}
            </span>
          )}
          <Badge icon={st?.icon} color={st?.color}>
            {st?.label}
          </Badge>
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onMark}
            className="btn-primary"
            style={primaryButtonStyle({ minHeight: 32, padding: '0 12px', fontSize: 12.5 })}
          >
            <Icon name="check" size={14} />
            Keldi
          </button>
          <button
            onClick={onOpen}
            title="Boshqa holat"
            aria-label="Boshqa holat"
            className="btn-secondary"
            style={secondaryButtonStyle({ minHeight: 32, padding: '0 9px' })}
          >
            <Icon name="more" size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   TAHRIRLASH OYNASI
   ════════════════════════════════════════════════════════════════ */

function EditModal({ worker, record, shiftStart, settings, onClose, onSave, onClear }) {
  const [time, setTime] = useState(record?.checkIn || timeNow())
  const [busy, setBusy] = useState(false)

  // Kiritilgan vaqt uchun natijani jonli ko'rsatamiz — foydalanuvchi
  // saqlashdan oldin oqibatini ko'rib turadi
  const preview = useMemo(
    () =>
      calcDay({
        status: 'keldi',
        checkIn: time,
        shiftStart,
        dailyRate: worker.dailyRate,
        settings,
      }),
    [time, shiftStart, worker.dailyRate, settings]
  )

  const st = STATUS[preview.status]

  async function run(fn) {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={worker.name} onClose={onClose} width={430}>
      <div
        style={{
          display: 'flex',
          gap: 18,
          fontSize: 12.5,
          color: COLORS.textMuted,
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <span>
          Smena: <strong style={{ color: COLORS.text }}>{shiftStart}</strong>
        </span>
        <span>
          Stavka: <strong style={{ color: COLORS.text }}>{formatSom(worker.dailyRate)} so‘m</strong>
        </span>
      </div>

      <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 6 }}>
        Kelgan vaqti
      </label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={inputStyle({ flex: 1 })}
        />
        <button onClick={() => setTime(timeNow())} className="btn-secondary" style={secondaryButtonStyle()}>
          Hozir
        </button>
      </div>

      {/* Natija */}
      <div
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: UI.radius.control,
          padding: 14,
          marginBottom: 18,
          fontSize: 13,
        }}
      >
        <Row
          label="Holat"
          value={
            <Badge icon={st?.icon} color={st?.color}>
              {st?.label}
            </Badge>
          }
        />
        {preview.late > 0 && (
          <Row label="Kechikish" value={formatDuration(preview.late)} color={COLORS.warning} />
        )}
        <Row
          label="Jarima"
          value={preview.penalty ? `−${formatSom(preview.penalty)} so‘m` : 'yo‘q'}
          color={preview.penalty ? COLORS.danger : COLORS.textMuted}
        />
        <Row
          label="Shu kun uchun"
          value={`${formatSom(preview.earned)} so‘m`}
          bold
        />
      </div>

      <button
        onClick={() => run(() => onSave({ status: 'keldi', checkIn: time }))}
        disabled={busy}
        className="btn-primary"
        style={primaryButtonStyle({ width: '100%', marginBottom: 18 })}
      >
        {busy ? <Spinner size={15} color="#fff" /> : 'Kelgan deb belgilash'}
      </button>

      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: COLORS.textMuted }}>
        Yoki boshqa holat
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {MANUAL_STATUSES.map((id) => {
          const s = STATUS[id]
          return (
            <button
              key={id}
              onClick={() => run(() => onSave({ status: id }))}
              disabled={busy}
              className="btn-secondary"
              style={secondaryButtonStyle({ flex: 1, fontSize: 12.5, padding: '0 8px' })}
            >
              <Icon name={s.icon} size={14} />
              {s.label}
            </button>
          )
        })}
      </div>

      {record && (
        <button
          onClick={() => run(onClear)}
          disabled={busy}
          className="btn-secondary"
          style={secondaryButtonStyle({
            width: '100%',
            marginTop: 14,
            color: COLORS.danger,
            borderColor: COLORS.danger + '33',
          })}
        >
          <Icon name="trash" size={14} />
          Belgini olib tashlash
        </button>
      )}
    </Modal>
  )
}

function Row({ label, value, color, bold }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '4px 0',
      }}
    >
      <span style={{ color: COLORS.textMuted }}>{label}</span>
      <span style={{ color: color || COLORS.text, fontWeight: bold ? 600 : 500 }}>{value}</span>
    </div>
  )
}
