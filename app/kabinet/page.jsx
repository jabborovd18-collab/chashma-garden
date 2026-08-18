'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * XODIM KABINETI
 * ════════════════════════════════════════════════════════════════
 * Oddiy xodim (afitsant, oshpaz va boshqalar) o'z login-paroli
 * bilan kirib, FAQAT o'ziga tegishli ma'lumotni ko'radi:
 *   · oylik yakun — hisoblangan, jarima, avans, qolgan summa
 *   · oxirgi 14 kunlik kelib-ketish jadvali
 *   · rahbariyat yozgan eslatmalar
 *
 * Hech narsani o'zgartira olmaydi (paroldan tashqari). Boshqa
 * xodimlarning ma'lumoti ko'rinmaydi — buni firestore.rules
 * server darajasida ta'minlaydi, brauzerdagi kod emas.
 *
 * Sahifa telefon uchun mo'ljallangan: xodimlarning ko'pi buni
 * kompyuterda emas, telefonda ochadi.
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth-context'
import { COLORS, STATUS, UI } from '@/lib/constants'
import {
  dateKey,
  monthKey,
  formatMonth,
  formatDate,
  formatSom,
  formatDuration,
  weekdayName,
  shiftDate,
} from '@/lib/utils'
import { monthlyTotal, payoutState } from '@/lib/payroll'
import {
  loadWorkerById,
  loadMyAttendance,
  loadMyAdvances,
  loadMyCharges,
  loadMyPayouts,
  loadNotes,
  loadPositions,
} from '@/lib/db'
import { changeOwnPassword } from '@/lib/worker-auth'
import { authErrorMessage, errorMessage } from '@/lib/auth-errors'
import { Icon, resolveIconName } from '@/components/icons'
import { QrCode } from '@/components/qr'
import { workerQrValue } from '@/lib/qr'
import {
  FullScreenLoading,
  SectionLoading,
  ErrorBanner,
  Badge,
  Avatar,
  Modal,
  Toast,
  useToast,
  Spinner,
  FormField,
  FormError,
  cardStyle,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from '@/components/ui'

const KUNLAR_SONI = 14

export default function KabinetPage() {
  const router = useRouter()
  const {
    user,
    profile,
    role,
    workerId,
    loading: authLoading,
    configError,
    logout,
    homePath,
  } = useAuth()
  const { toast, showToast } = useToast()

  const [worker, setWorker] = useState(null)
  const [position, setPosition] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [advances, setAdvances] = useState([])
  const [charges, setCharges] = useState([])
  const [payouts, setPayouts] = useState([])
  const [notes, setNotes] = useState([])

  const [month, setMonth] = useState(() => monthKey())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!authLoading && !configError && !user) router.replace('/login')
  }, [authLoading, configError, user, router])

  const load = useCallback(async () => {
    if (!workerId) return
    setError('')
    try {
      const [w, att, adv, chg, pay, nts, positions] = await Promise.all([
        loadWorkerById(workerId),
        loadMyAttendance(workerId),
        loadMyAdvances(workerId),
        loadMyCharges(workerId),
        loadMyPayouts(workerId),
        loadNotes(workerId),
        loadPositions(),
      ])
      setWorker(w)
      setPosition(positions.find((p) => p.id === w?.positionId) || null)
      setAttendance(att)
      setAdvances(adv)
      setCharges(chg)
      setPayouts(pay)
      setNotes(nts)
    } catch (err) {
      setError(errorMessage(err, 'Ma’lumotlarni yuklab bo‘lmadi'))
    } finally {
      setLoading(false)
    }
  }, [workerId])

  useEffect(() => {
    if (workerId) load()
  }, [workerId, load])

  /* ─── Hisob ─────────────────────────────────────────────────── */

  const monthRecords = useMemo(
    () => attendance.filter((r) => r.date?.startsWith(month)),
    [attendance, month]
  )

  const monthAdvances = useMemo(
    () => advances.filter((a) => a.date?.startsWith(month)),
    [advances, month]
  )

  const monthCharges = useMemo(
    () => charges.filter((c) => c.date?.startsWith(month)),
    [charges, month]
  )

  const monthPayouts = useMemo(
    () => payouts.filter((p) => p.month === month || p.date?.startsWith(month)),
    [payouts, month]
  )

  const totals = useMemo(
    () => monthlyTotal(monthRecords, monthAdvances, monthCharges),
    [monthRecords, monthAdvances, monthCharges]
  )

  /** Qancha berilgan va qancha qolgan */
  const state = useMemo(() => payoutState(totals, monthPayouts), [totals, monthPayouts])

  /** Oxirgi 14 kun — yozuvi yo'q kunlar ham ko'rsatiladi */
  const sonKunlar = useMemo(() => {
    const byDate = new Map(attendance.map((r) => [r.date, r]))
    const bugun = dateKey()
    const out = []
    for (let i = 0; i < KUNLAR_SONI; i++) {
      const d = shiftDate(bugun, -i)
      out.push({ date: d, record: byDate.get(d) || null })
    }
    return out
  }, [attendance])

  /* ─── Holatlar ──────────────────────────────────────────────── */

  if (authLoading) return <FullScreenLoading />
  if (!user) return <FullScreenLoading label="Kirish sahifasiga o‘tilmoqda" />

  // Panel xodimi (direktor/administrator/hostes) bu sahifaga kirsa
  if (role && role !== 'worker') {
    return (
      <Notice
        icon="briefcase"
        title="Bu sahifa xodimlar uchun"
        text="Sizning rolingizda nazorat paneli ochiladi."
        action={
          <Link href={homePath} style={primaryButtonStyle({ textDecoration: 'none' })}>
            Nazorat paneli
          </Link>
        }
      />
    )
  }

  if (!profile) {
    return (
      <Notice
        icon="lock"
        title="Hisobingiz faollashtirilmagan"
        text="Rahbariyatga murojaat qiling."
        action={
          <button onClick={logout} style={secondaryButtonStyle()}>
            Chiqish
          </button>
        }
      />
    )
  }

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh' }}>
        <SectionLoading />
      </div>
    )
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh' }}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ─── Sarlavha ─── */}
      <header
        style={{
          background: COLORS.primaryDark,
          color: COLORS.white,
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            maxWidth: 620,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Avatar name={profile.name} size={40} color="#FFFFFF" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{profile.name}</div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 2,
              }}
            >
              <Icon name={resolveIconName(position?.icon)} size={12} />
              {position?.name || 'Xodim'}
            </div>
          </div>
          <button
            onClick={logout}
            title="Chiqish"
            aria-label="Chiqish"
            style={{
              width: 34,
              height: 34,
              borderRadius: UI.radius.chip,
              border: 'none',
              background: 'rgba(255,255,255,0.16)',
              color: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="power" size={16} />
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: 620,
          margin: '0 auto',
          padding: '16px 16px 48px',
        }}
        className="animate-fadeIn"
      >
        {error && <ErrorBanner message={error} onRetry={load} />}

        {/* ─── QR kod ─── */}
        <div style={cardStyle({ padding: 18, marginBottom: 16, textAlign: 'center' })}>
          <Caption icon="qr">Ishga kelganda shu kodni ko‘rsating</Caption>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 12px' }}>
            <QrCode value={workerQrValue(workerId)} size={190} />
          </div>

          <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
            Hostes yoki administrator uni skanerlaydi — davomatingiz
            <br />
            avtomatik yoziladi. Ekran yorug‘ligini oshirsangiz tezroq o‘qiladi.
          </div>
        </div>

        {/* ─── Oy tanlash ─── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            gap: 10,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{formatMonth(month)}</h2>
          <input
            type="month"
            value={month}
            max={monthKey()}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            style={inputStyle({ width: 'auto', minHeight: 34, fontSize: 12.5 })}
          />
        </div>

        {/* ─── Oylik yakun ─── */}
        <div style={cardStyle({ padding: 16, marginBottom: 16 })}>
          <SummaryRow
            icon="calendarDays"
            label="Ishlangan kunlar"
            value={`${totals.ishlagan} kun`}
          />
          <SummaryRow
            icon="chart"
            label="Hisoblangan"
            value={`${formatSom(totals.hisoblangan)} so‘m`}
          />
          <SummaryRow
            icon="clock"
            label={`Jarimalar${totals.kechikkan ? ` (${totals.kechikkan} ta kechikish)` : ''}`}
            value={totals.jarima ? `− ${formatSom(totals.jarima)} so‘m` : '—'}
            color={totals.jarima ? COLORS.danger : COLORS.textFaint}
          />
          <SummaryRow
            icon="coins"
            label="Olingan avans"
            value={totals.avans ? `− ${formatSom(totals.avans)} so‘m` : '—'}
            color={totals.avans ? COLORS.warning : COLORS.textFaint}
          />
          <SummaryRow
            icon="alert"
            label="Zimmangizga yozilgan"
            value={totals.ushlanma ? `− ${formatSom(totals.ushlanma)} so‘m` : '—'}
            color={totals.ushlanma ? COLORS.danger : COLORS.textFaint}
          />

          {/* Oraliq yakun: ushlab qolinganlardan keyingi summa */}
          <div
            style={{
              borderTop: `1px solid ${COLORS.border}`,
              marginTop: 10,
              paddingTop: 10,
            }}
          >
            <SummaryRow
              icon="wallet"
              label="Sizga tegishli"
              value={`${formatSom(totals.yakuniy)} so‘m`}
            />
            <SummaryRow
              icon="checkCircle"
              label="Kassadan olgansiz"
              value={state.berilgan ? `− ${formatSom(state.berilgan)} so‘m` : '—'}
              color={state.berilgan ? COLORS.success : COLORS.textFaint}
            />
          </div>

          <div
            style={{
              borderTop: `1px solid ${COLORS.border}`,
              marginTop: 10,
              paddingTop: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>
              {state.toliq && state.berilgan > 0 ? 'To‘liq berildi' : 'Qolgan summa'}
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: state.qoldi > 0 ? COLORS.primary : COLORS.textMuted,
                letterSpacing: '-0.02em',
              }}
            >
              {formatSom(Math.max(0, state.qoldi))} <span style={{ fontSize: 14 }}>so‘m</span>
            </span>
          </div>

          <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 8, lineHeight: 1.55 }}>
            Kunlik stavka: {formatSom(worker?.dailyRate)} so‘m. Hisob har kuni belgilangan davomat
            asosida yangilanadi.
          </div>
        </div>

        {/* ─── Avanslar ro'yxati ─── */}
        {monthAdvances.length > 0 && (
          <div style={cardStyle({ padding: 16, marginBottom: 16 })}>
            <Caption icon="coins">Olingan avanslar</Caption>
            {monthAdvances.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '7px 0',
                  fontSize: 13,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <span style={{ color: COLORS.textMuted }}>
                  {formatDate(a.date)}
                  {a.note ? ` · ${a.note}` : ''}
                </span>
                <strong style={{ color: COLORS.warning }}>−{formatSom(a.amount)}</strong>
              </div>
            ))}
          </div>
        )}

        {/* ─── Kassadan olingan pullar ─── */}
        {monthPayouts.length > 0 && (
          <div style={cardStyle({ padding: 16, marginBottom: 16 })}>
            <Caption icon="banknote">Kassadan olgan pullaringiz</Caption>
            {monthPayouts.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '8px 0',
                  fontSize: 13,
                  borderBottom:
                    i === monthPayouts.length - 1 ? 'none' : `1px solid ${COLORS.border}`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div>{p.note || 'To‘lov'}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 2 }}>
                    {formatDate(p.date)}
                    {p.time ? `, ${p.time}` : ''}
                    {p.createdBy ? ` · ${p.createdBy}` : ''}
                  </div>
                </div>
                <strong style={{ color: COLORS.success, whiteSpace: 'nowrap' }}>
                  {formatSom(p.amount)}
                </strong>
              </div>
            ))}
            <div
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                marginTop: 8,
                paddingTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span>Jami olingan</span>
              <span style={{ color: COLORS.success }}>{formatSom(state.berilgan)} so‘m</span>
            </div>
          </div>
        )}

        {/* ─── Zimmasiga yozilganlar ─── */}
        {monthCharges.length > 0 && (
          <div style={cardStyle({ padding: 16, marginBottom: 16 })}>
            <Caption icon="alert">Zimmangizga yozilgan summalar</Caption>
            {monthCharges.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '8px 0',
                  fontSize: 13,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div>{c.reason}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 2 }}>
                    {formatDate(c.date)}
                  </div>
                </div>
                <strong style={{ color: COLORS.danger, whiteSpace: 'nowrap' }}>
                  −{formatSom(c.amount)}
                </strong>
              </div>
            ))}
            <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 10, lineHeight: 1.55 }}>
              Xato bo‘lsa rahbariyatga murojaat qiling — bu yozuvlarni faqat ular o‘zgartira oladi.
            </div>
          </div>
        )}

        {/* ─── Oxirgi 14 kun ─── */}
        <div style={cardStyle({ padding: 16, marginBottom: 16 })}>
          <Caption icon="attendance">Oxirgi {KUNLAR_SONI} kun</Caption>

          {sonKunlar.map(({ date, record }, i) => {
            const st = record ? STATUS[record.status] : null
            const bugun = date === dateKey()

            return (
              <div
                key={date}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 0',
                  borderBottom:
                    i === sonKunlar.length - 1 ? 'none' : `1px solid ${COLORS.border}`,
                }}
              >
                <div style={{ width: 92, flexShrink: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: bugun ? 600 : 400 }}>
                    {formatDate(date).replace(/ \d{4}$/, '')}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textFaint }}>
                    {bugun ? 'bugun' : weekdayName(date)}
                  </div>
                </div>

                <div style={{ width: 44, flexShrink: 0, fontSize: 13, fontWeight: 600 }}>
                  {record?.checkIn || ''}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {st ? (
                    <Badge icon={st.icon} color={st.color}>
                      {st.label}
                    </Badge>
                  ) : (
                    <span style={{ fontSize: 12, color: COLORS.textFaint }}>belgilanmagan</span>
                  )}
                  {record?.late > 0 && (
                    <span style={{ fontSize: 11.5, color: COLORS.warning, marginLeft: 8 }}>
                      +{formatDuration(record.late)}
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {record?.penalty > 0 && (
                    <div style={{ fontSize: 11.5, color: COLORS.danger }}>
                      −{formatSom(record.penalty)}
                    </div>
                  )}
                  {record && st?.paid && (
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {formatSom(record.earned || 0)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Eslatmalar ─── */}
        <div style={cardStyle({ padding: 16, marginBottom: 16 })}>
          <Caption icon="note">Eslatmalar</Caption>

          {notes.length === 0 ? (
            <div style={{ fontSize: 13, color: COLORS.textFaint, padding: '6px 0' }}>
              Hozircha eslatma yo‘q
            </div>
          ) : (
            notes.map((n, i) => (
              <div
                key={n.id}
                style={{
                  padding: '10px 0',
                  borderBottom: i === notes.length - 1 ? 'none' : `1px solid ${COLORS.border}`,
                }}
              >
                <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{n.text}</div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 4 }}>
                  {formatDate(n.date)} · {n.authorName}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── Parol ─── */}
        <button
          onClick={() => setShowPassword(true)}
          className="btn-secondary"
          style={secondaryButtonStyle({ width: '100%' })}
        >
          <Icon name="key" size={15} />
          Parolni o‘zgartirish
        </button>

        <div
          style={{
            fontSize: 11.5,
            color: COLORS.textFaint,
            textAlign: 'center',
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          Hisobda xatolik bor deb hisoblasangiz, rahbariyatga murojaat qiling.
          <br />
          Login: {profile.username}
        </div>
      </main>

      {showPassword && (
        <PasswordModal onClose={() => setShowPassword(false)} showToast={showToast} />
      )}
    </div>
  )
}

/* ─── Kichik komponentlar ─────────────────────────────────────── */

function Caption({ icon, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 10,
        color: COLORS.text,
      }}
    >
      <span style={{ color: COLORS.textMuted }}>
        <Icon name={icon} size={15} />
      </span>
      {children}
    </div>
  )
}

function SummaryRow({ icon, label, value, color }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '6px 0',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: COLORS.textMuted,
          minWidth: 0,
        }}
      >
        <Icon name={icon} size={14} />
        {label}
      </span>
      <strong style={{ fontSize: 13.5, color: color || COLORS.text, whiteSpace: 'nowrap' }}>
        {value}
      </strong>
    </div>
  )
}

function Notice({ icon, title, text, action }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: COLORS.bg,
      }}
    >
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: UI.radius.card,
          padding: 28,
          maxWidth: 380,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', color: COLORS.textFaint }}>
          <Icon name={icon} size={30} strokeWidth={1.3} />
        </div>
        <h2 style={{ fontSize: 16.5, marginTop: 14 }}>{title}</h2>
        <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8, lineHeight: 1.6 }}>
          {text}
        </p>
        {action && <div style={{ marginTop: 20 }}>{action}</div>}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   PAROLNI O'ZGARTIRISH
   ════════════════════════════════════════════════════════════════ */

function PasswordModal({ onClose, showToast }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [next2, setNext2] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setError('')
    if (!current) return setError('Joriy parolni kiriting')
    if (next.length < 6) return setError('Yangi parol kamida 6 ta belgidan iborat bo‘lsin')
    if (next !== next2) return setError('Yangi parollar mos kelmadi')

    setBusy(true)
    try {
      await changeOwnPassword(current, next)
      showToast('Parol o‘zgartirildi')
      onClose()
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Modal title="Parolni o‘zgartirish" onClose={onClose} width={400}>
      <FormField label="Joriy parol">
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          style={inputStyle()}
        />
      </FormField>

      <FormField label="Yangi parol" hint="Kamida 6 ta belgi">
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          style={inputStyle()}
        />
      </FormField>

      <FormField label="Yangi parolni takrorlang">
        <input
          type="password"
          value={next2}
          onChange={(e) => setNext2(e.target.value)}
          autoComplete="new-password"
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
          {busy ? <Spinner size={15} color="#fff" /> : 'Saqlash'}
        </button>
      </div>
    </Modal>
  )
}
