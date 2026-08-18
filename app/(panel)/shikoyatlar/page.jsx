'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * SHIKOYATLAR
 * ════════════════════════════════════════════════════════════════
 * Kassir, administrator yoki hostes mijozdan shikoyat qabul qilib
 * shu yerga kiritadi. Shikoyat restoran majlisida muhokama qilinishi
 * uchun to'planadi.
 *
 * 2-bosqichda: yozilgan shikoyat darhol Telegram'dagi shikoyatlar
 * guruhiga yuboriladi. Shuning uchun har bir yozuvda `sentToTelegram`
 * maydoni bor — bot qaysilarini yuborganini shu orqali biladi.
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/auth-context'
import { COLORS, COMPLAINT_SOURCES, COMPLAINT_STATUS, UI } from '@/lib/constants'
import { dateKey, timeNow, formatDate } from '@/lib/utils'
import {
  loadComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  loadWorkers,
} from '@/lib/db'
import { Icon } from '@/components/icons'
import {
  SectionHeader,
  SectionLoading,
  ErrorBanner,
  InfoBanner,
  EmptyState,
  StatCard,
  StatGrid,
  Badge,
  Modal,
  ConfirmModal,
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
import { errorMessage } from '@/lib/auth-errors'

export default function ShikoyatlarPage() {
  const { profile, role, isDirector } = useAuth()
  const { toast, showToast } = useToast()

  const [items, setItems] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const canModerate = role === 'director' || role === 'admin'

  const refresh = useCallback(async () => {
    setError('')
    try {
      const [c, w] = await Promise.all([loadComplaints(), loadWorkers()])
      setItems(c)
      setWorkers(w.filter((x) => x.active !== false))
    } catch (err) {
      setError(errorMessage(err, 'Shikoyatlarni yuklab bo‘lmadi'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const stats = useMemo(
    () => ({
      jami: items.length,
      yangi: items.filter((i) => i.status === 'yangi').length,
      muhokamada: items.filter((i) => i.status === 'muhokamada').length,
      hal: items.filter((i) => i.status === 'hal').length,
    }),
    [items]
  )

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  )

  async function changeStatus(item, status) {
    setBusyId(item.id)
    try {
      await updateComplaint(item.id, { status })
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)))
      showToast(`Holat: ${COMPLAINT_STATUS[status].label}`)
    } catch (err) {
      showToast(errorMessage(err, 'O‘zgartirib bo‘lmadi'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    try {
      await deleteComplaint(confirmDel.id)
      setItems((prev) => prev.filter((i) => i.id !== confirmDel.id))
      showToast('Shikoyat o‘chirildi')
      setConfirmDel(null)
    } catch (err) {
      showToast(errorMessage(err, 'O‘chirib bo‘lmadi'), 'error')
    }
  }

  if (loading) return <SectionLoading />

  return (
    <div className="animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <SectionHeader
        icon="megaphone"
        title="Shikoyatlar"
        subtitle="Mijozlardan kelgan e’tirozlar — majlisda muhokama uchun"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
            style={primaryButtonStyle()}
          >
            <Icon name="plus" size={15} />
            Shikoyat
          </button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      <InfoBanner icon="robot">
        Telegram bot ulanganidan keyin bu yerga kiritilgan har bir shikoyat avtomatik ravishda
        shikoyatlar guruhiga yuboriladi. Hozircha yozuvlar bazada to‘planib boradi.
      </InfoBanner>

      <StatGrid min={130}>
        <StatCard icon="megaphone" label="Jami" value={stats.jami} />
        <StatCard
          icon="alert"
          label="Yangi"
          value={stats.yangi}
          tone={stats.yangi ? 'danger' : undefined}
        />
        <StatCard icon="clock" label="Muhokamada" value={stats.muhokamada} />
        <StatCard icon="checkCircle" label="Hal qilindi" value={stats.hal} />
      </StatGrid>

      <div style={{ marginBottom: 16 }}>
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'all', label: 'Hammasi', count: stats.jami },
            { id: 'yangi', label: 'Yangi', count: stats.yangi },
            { id: 'muhokamada', label: 'Muhokamada', count: stats.muhokamada },
            { id: 'hal', label: 'Hal qilindi', count: stats.hal },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="checkCircle"
          title={items.length === 0 ? 'Shikoyat yo‘q' : 'Bu holatda shikoyat yo‘q'}
          subtitle={items.length === 0 ? 'Mijozlardan e’tiroz tushmagan' : null}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((c) => {
            const st = COMPLAINT_STATUS[c.status] || COMPLAINT_STATUS.yangi
            return (
              <div key={c.id} style={cardStyle({ padding: 15 })}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 10,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge color={st.color}>{st.label}</Badge>
                    <span style={{ fontSize: 11.5, color: COLORS.textMuted }}>
                      {formatDate(c.date)}
                      {c.time && `, ${c.time}`}
                    </span>
                  </div>

                  {isDirector && (
                    <IconButton
                      icon="trash"
                      title="O‘chirish"
                      size={28}
                      color={COLORS.danger}
                      onClick={() => setConfirmDel(c)}
                    />
                  )}
                </div>

                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: COLORS.text }}>{c.text}</p>

                <div
                  style={{
                    display: 'flex',
                    gap: 14,
                    marginTop: 11,
                    fontSize: 11.5,
                    color: COLORS.textMuted,
                    flexWrap: 'wrap',
                  }}
                >
                  <Meta icon="user">
                    {c.takenBy}
                    {c.source &&
                      ` (${COMPLAINT_SOURCES.find((s) => s.id === c.source)?.label || c.source})`}
                  </Meta>
                  {c.customer && <Meta icon="users">{c.customer}</Meta>}
                  {c.tableNo && <Meta icon="table">{c.tableNo}-stol</Meta>}
                  {c.aboutWorkerName && <Meta icon="alert">{c.aboutWorkerName}</Meta>}
                </div>

                {canModerate && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: `1px solid ${COLORS.border}`,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    {busyId === c.id ? (
                      <Spinner size={17} />
                    ) : (
                      Object.values(COMPLAINT_STATUS)
                        .filter((s) => s.id !== c.status)
                        .map((s) => (
                          <button
                            key={s.id}
                            onClick={() => changeStatus(c, s.id)}
                            className="btn-secondary"
                            style={secondaryButtonStyle({
                              minHeight: 30,
                              padding: '0 11px',
                              fontSize: 12,
                              color: COLORS.textMuted,
                            })}
                          >
                            {s.label}
                            <Icon name="arrowRight" size={13} />
                          </button>
                        ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <ComplaintModal
          workers={workers}
          profile={profile}
          role={role}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false)
            showToast('Shikoyat qayd etildi')
            await refresh()
          }}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          title="Shikoyatni o‘chirish"
          message="Bu yozuv butunlay o‘chiriladi. Davom etamizmi?"
          confirmLabel="O‘chirish"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

function Meta({ icon, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <Icon name={icon} size={12} />
      {children}
    </span>
  )
}

/* ════════════════════════════════════════════════════════════════
   SHIKOYAT KIRITISH
   ════════════════════════════════════════════════════════════════ */

function ComplaintModal({ workers, profile, role, onClose, onSaved }) {
  const [form, setForm] = useState({
    text: '',
    source: role === 'hostes' ? 'hostes' : role === 'admin' ? 'administrator' : 'kassir',
    customer: '',
    tableNo: '',
    aboutWorkerId: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function save() {
    setError('')
    if (form.text.trim().length < 5) return setError('Shikoyat matnini to‘liqroq yozing')

    setBusy(true)
    try {
      const worker = workers.find((w) => w.id === form.aboutWorkerId)
      await createComplaint({
        text: form.text.trim(),
        source: form.source,
        customer: form.customer.trim() || null,
        tableNo: form.tableNo.trim() || null,
        aboutWorkerId: form.aboutWorkerId || null,
        aboutWorkerName: worker?.name || null,
        takenBy: profile?.name || '—',
        takenByUid: profile?.id || null,
        date: dateKey(),
        time: timeNow(),
        status: 'yangi',
        // Bot shu bayroqqa qarab yuborilmaganlarini topadi
        sentToTelegram: false,
      })
      await onSaved()
    } catch (err) {
      setError(errorMessage(err, 'Saqlab bo‘lmadi'))
      setBusy(false)
    }
  }

  return (
    <Modal title="Yangi shikoyat" onClose={onClose}>
      <FormField
        label="Shikoyat matni"
        hint="Mijoz nimadan norozi bo‘ldi — imkon qadar aniq yozing"
      >
        <textarea
          value={form.text}
          onChange={set('text')}
          rows={4}
          placeholder="Masalan: Buyurtma 40 daqiqa kechikdi, ovqat sovuq kelgan"
          style={inputStyle({ minHeight: 96, resize: 'vertical', lineHeight: 1.55, padding: '10px 12px' })}
        />
      </FormField>

      <FormField label="Kim qabul qildi">
        <select value={form.source} onChange={set('source')} style={inputStyle()}>
          {COMPLAINT_SOURCES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </FormField>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 2 }}>
          <FormField label="Mijoz (ixtiyoriy)">
            <input value={form.customer} onChange={set('customer')} style={inputStyle()} />
          </FormField>
        </div>
        <div style={{ flex: 1 }}>
          <FormField label="Stol">
            <input
              value={form.tableNo}
              onChange={set('tableNo')}
              inputMode="numeric"
              style={inputStyle()}
            />
          </FormField>
        </div>
      </div>

      <FormField
        label="Qaysi xodimga tegishli (ixtiyoriy)"
        hint="Aniq xodim bilan bog‘liq bo‘lsa tanlang — majlisda muhokama qilish osonlashadi"
      >
        <select value={form.aboutWorkerId} onChange={set('aboutWorkerId')} style={inputStyle()}>
          <option value="">— tegishli emas —</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
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
          {busy ? <Spinner size={15} color="#fff" /> : 'Qayd etish'}
        </button>
      </div>
    </Modal>
  )
}
