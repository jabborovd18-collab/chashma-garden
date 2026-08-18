'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * SOZLAMALAR
 * ════════════════════════════════════════════════════════════════
 * Uch bo'lim:
 *   1. Jarima qoidalari — kechikish qanday hisoblanishi
 *   2. Panel foydalanuvchilari — kim qaysi rol bilan kiradi
 *   3. Telegram — 2-bosqichda ishga tushadi
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getSecondaryAuth } from '@/firebase/config'
import { useAuth } from '@/components/auth-context'
import { COLORS, ROLE_LIST, ROLES, DEFAULT_SETTINGS, UI } from '@/lib/constants'
import { formatSom, parseSom, formatDuration } from '@/lib/utils'
import { loginToEmail, normalizeLogin, validateLogin, suggestLogin } from '@/lib/username'
import { penaltyFor, withDefaults } from '@/lib/payroll'
import { authErrorMessage, errorMessage } from '@/lib/auth-errors'
import {
  loadSettings,
  saveSettings,
  loadUsers,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '@/lib/db'
import { Icon } from '@/components/icons'
import { botStatus, botGroups, botTest, sendReportNow } from '@/lib/telegram-client'
import {
  SectionHeader,
  SectionLoading,
  ErrorBanner,
  InfoBanner,
  Badge,
  Avatar,
  Modal,
  ConfirmModal,
  Toast,
  useToast,
  Toggle,
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

export default function SozlamalarPage() {
  const { profile, refreshProfile } = useAuth()
  const { toast, showToast } = useToast()

  const [tab, setTab] = useState('jarima')
  const [settings, setSettings] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setError('')
    try {
      const [s, u] = await Promise.all([loadSettings(), loadUsers()])
      setSettings(withDefaults(s))
      setUsers(u)
    } catch (err) {
      setError(errorMessage(err, 'Sozlamalarni yuklab bo‘lmadi'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (loading) return <SectionLoading />

  return (
    <div className="animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <SectionHeader
        icon="settings"
        title="Sozlamalar"
        subtitle="Tizim qoidalari va kirish huquqlari"
      />

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      <div style={{ marginBottom: 20 }}>
        <FilterChips
          value={tab}
          onChange={setTab}
          options={[
            { id: 'jarima', label: 'Jarima qoidalari' },
            { id: 'users', label: 'Foydalanuvchilar', count: users.length },
            { id: 'telegram', label: 'Telegram' },
          ]}
        />
      </div>

      {tab === 'jarima' && (
        <PenaltySettings settings={settings} onSaved={refresh} showToast={showToast} />
      )}
      {tab === 'users' && (
        <UsersSettings
          users={users}
          currentUid={profile?.id}
          onChanged={refresh}
          onSelfChanged={refreshProfile}
          showToast={showToast}
        />
      )}
      {tab === 'telegram' && (
        <TelegramSettings settings={settings} onSaved={refresh} showToast={showToast} />
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   1. JARIMA QOIDALARI
   ════════════════════════════════════════════════════════════════ */

function PenaltySettings({ settings, onSaved, showToast }) {
  const [form, setForm] = useState(settings)
  const [busy, setBusy] = useState(false)
  const [sampleRate, setSampleRate] = useState(100000)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const preview = useMemo(
    () =>
      [5, 15, 30, 45, 60, 90, 120].map((m) => ({
        late: m,
        penalty: penaltyFor(m, sampleRate, form),
      })),
    [form, sampleRate]
  )

  async function save() {
    setBusy(true)
    try {
      await saveSettings({
        graceMinutes: Number(form.graceMinutes) || 0,
        penaltyMode: form.penaltyMode,
        perMinuteAmount: Number(form.perMinuteAmount) || 0,
        tiers: form.tiers,
        maxPenaltyPercent: Number(form.maxPenaltyPercent) || 100,
        defaultShiftStart: form.defaultShiftStart,
      })
      await onSaved()
      showToast('Jarima qoidalari saqlandi')
    } catch (err) {
      showToast(errorMessage(err, 'Saqlab bo‘lmadi'), 'error')
    } finally {
      setBusy(false)
    }
  }

  function updateTier(i, key, value) {
    set('tiers', form.tiers.map((t, idx) => (idx === i ? { ...t, [key]: Number(value) || 0 } : t)))
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        alignItems: 'start',
      }}
    >
      <div style={cardStyle({ padding: 18 })}>
        <h3 style={{ fontSize: 14.5, marginBottom: 16 }}>Qoidalar</h3>

        <FormField
          label="Erkinlik vaqti (daqiqa)"
          hint="Shu daqiqagacha kechikish jarimasiz kechiriladi. 0 qo‘ysangiz — har qanday kechikish jarimali."
        >
          <input
            type="number"
            min={0}
            max={120}
            value={form.graceMinutes}
            onChange={(e) => set('graceMinutes', e.target.value)}
            style={inputStyle()}
          />
        </FormField>

        <FormField label="Hisoblash usuli">
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'tiered', label: 'Pog‘onali (%)' },
              { id: 'per_minute', label: 'Daqiqalik (so‘m)' },
            ].map((m) => {
              const active = form.penaltyMode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => set('penaltyMode', m.id)}
                  style={{
                    flex: 1,
                    minHeight: UI.control.height,
                    borderRadius: UI.radius.control,
                    border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
                    background: active ? COLORS.primarySoft : COLORS.surface,
                    color: active ? COLORS.primary : COLORS.textMuted,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
        </FormField>

        {form.penaltyMode === 'per_minute' ? (
          <FormField
            label="Har kechikkan daqiqa uchun (so‘m)"
            hint="Erkinlik vaqtidan keyingi har bir daqiqa uchun shu summa ushlanadi"
          >
            <input
              inputMode="numeric"
              value={formatSom(form.perMinuteAmount)}
              onChange={(e) => set('perMinuteAmount', parseSom(e.target.value))}
              style={inputStyle()}
            />
          </FormField>
        ) : (
          <FormField
            label="Pog‘onalar"
            hint="Jarimali kechikish ko‘rsatilgan daqiqadan oshsa, kunlik stavkadan shuncha foiz ushlanadi"
          >
            {form.tiers.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 7 }}>
                <input
                  type="number"
                  min={0}
                  value={t.minutes}
                  onChange={(e) => updateTier(i, 'minutes', e.target.value)}
                  style={inputStyle({ flex: 1 })}
                />
                <span style={{ fontSize: 12, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                  daq
                </span>
                <Icon name="arrowRight" size={14} style={{ color: COLORS.textFaint }} />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={t.percent}
                  onChange={(e) => updateTier(i, 'percent', e.target.value)}
                  style={inputStyle({ flex: 1 })}
                />
                <span style={{ fontSize: 12.5, color: COLORS.textMuted }}>%</span>
                <IconButton
                  icon="x"
                  title="O‘chirish"
                  size={30}
                  color={COLORS.danger}
                  onClick={() => set('tiers', form.tiers.filter((_, idx) => idx !== i))}
                />
              </div>
            ))}
            <button
              onClick={() => set('tiers', [...form.tiers, { minutes: 0, percent: 0 }])}
              className="btn-secondary"
              style={secondaryButtonStyle({ width: '100%', marginTop: 4, minHeight: 34 })}
            >
              <Icon name="plus" size={14} />
              Pog‘ona qo‘shish
            </button>
          </FormField>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Jarima chegarasi (%)" hint="Kunlik stavkaning shu foizidan oshmaydi">
              <input
                type="number"
                min={0}
                max={100}
                value={form.maxPenaltyPercent}
                onChange={(e) => set('maxPenaltyPercent', e.target.value)}
                style={inputStyle()}
              />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Standart smena" hint="Lavozimda vaqt ko‘rsatilmagan bo‘lsa">
              <input
                type="time"
                value={form.defaultShiftStart}
                onChange={(e) => set('defaultShiftStart', e.target.value)}
                style={inputStyle()}
              />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button
            onClick={() => setForm(withDefaults(DEFAULT_SETTINGS))}
            className="btn-secondary"
            style={secondaryButtonStyle({ flex: 1 })}
          >
            Standartga qaytarish
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
      </div>

      {/* Jonli namuna */}
      <div style={cardStyle({ padding: 18 })}>
        <h3 style={{ fontSize: 14.5 }}>Namuna hisob</h3>
        <p style={{ fontSize: 12.5, color: COLORS.textMuted, margin: '6px 0 16px', lineHeight: 1.5 }}>
          Qoidani o‘zgartirganingizda jarima qanday chiqishini shu yerda darhol ko‘rasiz.
        </p>

        <FormField label="Namuna kunlik stavka">
          <input
            inputMode="numeric"
            value={formatSom(sampleRate)}
            onChange={(e) => setSampleRate(parseSom(e.target.value))}
            style={inputStyle()}
          />
        </FormField>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ padding: '8px 4px', textAlign: 'left', fontSize: 11.5, color: COLORS.textMuted, fontWeight: 600 }}>
                Kechikish
              </th>
              <th style={{ padding: '8px 4px', textAlign: 'right', fontSize: 11.5, color: COLORS.textMuted, fontWeight: 600 }}>
                Jarima
              </th>
              <th style={{ padding: '8px 4px', textAlign: 'right', fontSize: 11.5, color: COLORS.textMuted, fontWeight: 600 }}>
                Qo‘lga tegadi
              </th>
            </tr>
          </thead>
          <tbody>
            {preview.map((p) => (
              <tr key={p.late} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '8px 4px' }}>{formatDuration(p.late)}</td>
                <td
                  style={{
                    padding: '8px 4px',
                    textAlign: 'right',
                    color: p.penalty ? COLORS.danger : COLORS.textFaint,
                    fontWeight: p.penalty ? 600 : 400,
                  }}
                >
                  {p.penalty ? `−${formatSom(p.penalty)}` : 'yo‘q'}
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600 }}>
                  {formatSom(sampleRate - p.penalty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 16 }}>
          <InfoBanner icon="bulb" tone="neutral">
            Erkinlik vaqti <strong>{form.graceMinutes} daqiqa</strong> — ya’ni {form.graceMinutes}{' '}
            daqiqagacha kechikkan xodim jarima to‘lamaydi.
          </InfoBanner>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   2. PANEL FOYDALANUVCHILARI
   ════════════════════════════════════════════════════════════════ */

function UsersSettings({ users, currentUid, onChanged, onSelfChanged, showToast }) {
  const [showForm, setShowForm] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function toggleActive(u) {
    setBusyId(u.id)
    try {
      await updateUserProfile(u.id, { active: !u.active })
      await onChanged()
      if (u.id === currentUid) await onSelfChanged()
      showToast(u.active ? 'Kirish to‘xtatildi' : 'Kirish tiklandi')
    } catch (err) {
      showToast(errorMessage(err, 'O‘zgartirib bo‘lmadi'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function remove() {
    try {
      await deleteUserProfile(confirmDel.id)
      await onChanged()
      showToast('Foydalanuvchi o‘chirildi')
      setConfirmDel(null)
    } catch (err) {
      showToast(errorMessage(err, 'O‘chirib bo‘lmadi'), 'error')
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <InfoBanner>
        Bu ro‘yxat — <strong>panelga kira oladigan</strong> odamlar. Restoran xodimlari (afitsant,
        oshpaz va boshqalar) bu yerga kiritilmaydi — ular «Xodimlar» bo‘limida.
      </InfoBanner>

      <button
        onClick={() => setShowForm(true)}
        className="btn-primary"
        style={primaryButtonStyle({ marginBottom: 14 })}
      >
        <Icon name="plus" size={15} />
        Foydalanuvchi qo‘shish
      </button>

      <div style={cardStyle({ overflow: 'hidden' })}>
        {users.map((u, i) => {
          const r = ROLES[u.role] || { label: u.role, icon: 'user' }
          const isSelf = u.id === currentUid
          return (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '11px 13px',
                borderBottom: i === users.length - 1 ? 'none' : `1px solid ${COLORS.border}`,
                opacity: u.active ? 1 : 0.5,
              }}
            >
              <Avatar name={u.name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    display: 'flex',
                    gap: 7,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {u.name}
                  {isSelf && <Badge color={COLORS.info}>siz</Badge>}
                  {!u.active && <Badge>to‘xtatilgan</Badge>}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: COLORS.textMuted,
                    marginTop: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Icon name={r.icon} size={12} />
                  {r.label}
                  <span style={{ color: COLORS.textFaint }}>·</span>
                  {/* Eski hisoblarda username yo'q — email ko'rsatiladi */}
                  {u.username || u.email}
                </div>
              </div>

              {busyId === u.id ? (
                <Spinner size={17} />
              ) : (
                <>
                  <Toggle value={!!u.active} onChange={() => toggleActive(u)} />
                  {!isSelf && (
                    <IconButton
                      icon="trash"
                      title="O‘chirish"
                      color={COLORS.danger}
                      onClick={() => setConfirmDel(u)}
                    />
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {showForm && (
        <NewUserModal
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false)
            await onChanged()
            showToast('Foydalanuvchi yaratildi')
          }}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          title="Foydalanuvchini o‘chirish"
          message={`${confirmDel.name} panelga kira olmaydi. Diqqat: bu faqat panel huquqini o‘chiradi — Firebase Authentication'dagi hisobni Firebase Console orqali alohida o‘chirish kerak.`}
          confirmLabel="O‘chirish"
          onConfirm={remove}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

function NewUserModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', login: '', password: '', role: 'hostes' })
  const [loginTouched, setLoginTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function changeName(e) {
    const name = e.target.value
    setForm((f) => ({ ...f, name, login: loginTouched ? f.login : suggestLogin(name) }))
  }

  async function save() {
    setError('')
    if (!form.name.trim()) return setError('Ismni kiriting')

    const loginError = validateLogin(form.login)
    if (loginError) return setError(loginError)

    if (form.password.length < 6) return setError('Parol kamida 6 ta belgi bo‘lsin')

    setBusy(true)
    try {
      // Ikkinchi Firebase ilovasi orqali yaratamiz — aks holda joriy
      // direktor seansdan chiqib, yangi foydalanuvchi sifatida kirib qolardi
      const secondary = getSecondaryAuth()
      const cred = await createUserWithEmailAndPassword(
        secondary,
        loginToEmail(form.login),
        form.password
      )

      await createUserProfile(cred.user.uid, {
        name: form.name.trim(),
        username: form.login,
        role: form.role,
        active: true,
      })

      await signOut(secondary)
      await onSaved()
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Modal title="Yangi foydalanuvchi" onClose={onClose} width={450}>
      <FormField label="To‘liq ism">
        <input value={form.name} onChange={changeName} style={inputStyle()} />
      </FormField>

      <FormField label="Login" hint="Shu login bilan panelga kiradi. Takrorlanmas bo‘lishi shart">
        <input
          value={form.login}
          onChange={(e) => {
            setLoginTouched(true)
            setForm((f) => ({ ...f, login: normalizeLogin(e.target.value) }))
          }}
          placeholder="aziz.karimov"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          style={inputStyle()}
        />
      </FormField>

      <FormField label="Parol" hint="Kamida 6 ta belgi. Keyin foydalanuvchiga aytib qo‘ying">
        <input type="text" value={form.password} onChange={set('password')} style={inputStyle()} />
      </FormField>

      <FormField label="Rol">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {ROLE_LIST.map((r) => {
            const active = form.role === r.id
            return (
              <button
                key={r.id}
                onClick={() => setForm((f) => ({ ...f, role: r.id }))}
                style={{
                  textAlign: 'left',
                  padding: 12,
                  borderRadius: UI.radius.control,
                  border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
                  background: active ? COLORS.primarySoft : COLORS.surface,
                  display: 'flex',
                  gap: 11,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ color: active ? COLORS.primary : COLORS.textMuted, marginTop: 1 }}>
                  <Icon name={r.icon} size={17} />
                </span>
                <span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, display: 'block' }}>{r.label}</span>
                  <span style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2, display: 'block' }}>
                    {r.desc}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
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
          {busy ? <Spinner size={15} color="#fff" /> : 'Yaratish'}
        </button>
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════════════════════════
   3. TELEGRAM BOT
   ════════════════════════════════════════════════════════════════ */

function TelegramSettings({ settings, onSaved, showToast }) {
  const [form, setForm] = useState(settings.telegram)
  const [busy, setBusy] = useState(false)

  const [holat, setHolat] = useState(null)
  const [holatYuklanmoqda, setHolatYuklanmoqda] = useState(true)

  const [guruhlar, setGuruhlar] = useState(null)
  const [qidirilmoqda, setQidirilmoqda] = useState(false)
  const [sinovId, setSinovId] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  /* ─── Holat ──────────────────────────────────────────────────── */

  const holatniYukla = useCallback(async () => {
    setHolatYuklanmoqda(true)
    const res = await botStatus()
    setHolat(res.ok ? res : { xato: res.error })
    setHolatYuklanmoqda(false)
  }, [])

  useEffect(() => {
    holatniYukla()
  }, [holatniYukla])

  /* ─── Amallar ────────────────────────────────────────────────── */

  async function guruhlarniTop() {
    setQidirilmoqda(true)
    const res = await botGroups()
    setQidirilmoqda(false)

    if (!res.ok) {
      showToast(res.error || 'Guruhlarni topib bo‘lmadi', 'error')
      return
    }

    setGuruhlar(res.chats)
    if (res.chats.length === 0) {
      showToast('Guruh topilmadi — botni guruhga qo‘shib, xabar yozing', 'info')
    }
  }

  async function sinovYubor(maydon, chatId, nom) {
    if (!chatId) return showToast('Avval guruh ID sini kiriting', 'error')

    setSinovId(maydon)
    const res = await botTest(chatId, nom)
    setSinovId(null)

    showToast(res.ok ? `«${nom}» guruhiga xabar yuborildi` : res.error, res.ok ? 'success' : 'error')
  }

  async function hisobotYubor() {
    setBusy(true)
    const res = await sendReportNow()
    setBusy(false)

    if (!res.ok) return showToast(res.error, 'error')
    showToast(
      res.yuborildi ? `Hisobot yuborildi: ${res.kelgan}/${res.jami}` : res.sabab,
      res.yuborildi ? 'success' : 'info'
    )
  }

  async function save() {
    setBusy(true)
    try {
      await saveSettings({ telegram: form })
      await onSaved()
      showToast('Telegram sozlamalari saqlandi')
    } catch (err) {
      showToast(errorMessage(err, 'Saqlab bo‘lmadi'), 'error')
    } finally {
      setBusy(false)
    }
  }

  /* ─── Ko'rinish ──────────────────────────────────────────────── */

  const tayyor = holat?.ok && holat.serverSozlangan && holat.tokenBor && holat.bot

  const MAYDONLAR = [
    {
      kalit: 'complaintsChatId',
      nom: 'Shikoyatlar guruhi',
      izoh: 'Yangi shikoyat kiritilganda darhol yuboriladi',
    },
    {
      kalit: 'attendanceChatId',
      nom: 'Davomat guruhi',
      izoh: 'Xodim kelganda xabar tushadi',
    },
    {
      kalit: 'adminChatId',
      nom: 'Adminlar guruhi',
      izoh: 'Kuniga ikki marta yig‘ma hisobot',
    },
  ]

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
      {/* ─── Sozlamalar ─── */}
      <div style={cardStyle({ padding: 18 })}>
        <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>Guruhlar</h3>

        {MAYDONLAR.map((m) => (
          <FormField key={m.kalit} label={m.nom} hint={m.izoh}>
            <div style={{ display: 'flex', gap: 7 }}>
              <input
                value={form[m.kalit] || ''}
                onChange={(e) => set(m.kalit, e.target.value.trim())}
                placeholder="-1001234567890"
                style={inputStyle({ flex: 1 })}
              />
              <button
                onClick={() => sinovYubor(m.kalit, form[m.kalit], m.nom)}
                disabled={!tayyor || sinovId === m.kalit}
                title="Sinov xabari yuborish"
                className="btn-secondary"
                style={secondaryButtonStyle({ padding: '0 11px' })}
              >
                {sinovId === m.kalit ? <Spinner size={14} /> : <Icon name="arrowRight" size={15} />}
              </button>
            </div>
          </FormField>
        ))}

        <FormField label="Hisobot vaqtlari" hint="Toshkent soati bo‘yicha, kuniga 2 marta">
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1].map((i) => (
              <input
                key={i}
                type="time"
                value={form.reportTimes?.[i] || ''}
                onChange={(e) => {
                  const t = [...(form.reportTimes || ['', ''])]
                  t[i] = e.target.value
                  set('reportTimes', t)
                }}
                style={inputStyle({ flex: 1 })}
              />
            ))}
          </div>
        </FormField>

        <ToggleRow
          nom="Faqat kechikkanlar"
          izoh="70 ta xodim bo‘lsa har kelgan uchun xabar ko‘p bo‘ladi"
          value={!!form.onlyLate}
          onChange={(v) => set('onlyLate', v)}
        />

        <ToggleRow
          nom="Botni yoqish"
          izoh="O‘chirilgan bo‘lsa hech qanday xabar yuborilmaydi"
          value={!!form.enabled}
          onChange={(v) => set('enabled', v)}
        />

        <button
          onClick={save}
          disabled={busy}
          className="btn-primary"
          style={primaryButtonStyle({ width: '100%' })}
        >
          {busy ? <Spinner size={15} color="#fff" /> : 'Saqlash'}
        </button>
      </div>

      {/* ─── Holat va yordam ─── */}
      <div style={cardStyle({ padding: 18 })}>
        <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>Holat</h3>

        {holatYuklanmoqda ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <Spinner size={20} />
          </div>
        ) : (
          <>
            <HolatQator
              nom="Server kaliti"
              yaxshi={holat?.serverSozlangan}
              izoh={
                holat?.serverSozlangan
                  ? 'Firebase Admin SDK ulangan'
                  : `Yetishmaydi: ${(holat?.yetishmaydi || []).join(', ')}`
              }
            />
            <HolatQator
              nom="Bot tokeni"
              yaxshi={holat?.tokenBor && !!holat?.bot}
              izoh={
                holat?.bot
                  ? `@${holat.bot.username}`
                  : holat?.botXatosi || 'TELEGRAM_BOT_TOKEN sozlanmagan'
              }
            />
            <HolatQator
              nom="Cron kaliti"
              yaxshi={holat?.cronSozlangan}
              izoh={
                holat?.cronSozlangan
                  ? 'Avtomatik hisobot uchun tayyor'
                  : 'CRON_SECRET sozlanmagan — hisobot faqat qo‘lda yuboriladi'
              }
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                onClick={holatniYukla}
                className="btn-secondary"
                style={secondaryButtonStyle({ flex: 1 })}
              >
                <Icon name="refresh" size={14} />
                Yangilash
              </button>
              <button
                onClick={hisobotYubor}
                disabled={!tayyor || busy}
                className="btn-secondary"
                style={secondaryButtonStyle({ flex: 1 })}
              >
                <Icon name="chart" size={14} />
                Hisobot yuborish
              </button>
            </div>
          </>
        )}

        {/* ─── Guruh ID topish ─── */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 14.5, marginBottom: 6 }}>Guruh ID sini topish</h3>
          <ol
            style={{
              fontSize: 12.5,
              color: COLORS.textMuted,
              lineHeight: 1.75,
              paddingLeft: 18,
              marginBottom: 12,
            }}
          >
            <li>Botni guruhga qo‘shing va administrator qiling</li>
            <li>Guruhga istalgan xabar yozing</li>
            <li>Quyidagi tugmani bosing</li>
          </ol>

          <button
            onClick={guruhlarniTop}
            disabled={!tayyor || qidirilmoqda}
            className="btn-secondary"
            style={secondaryButtonStyle({ width: '100%' })}
          >
            {qidirilmoqda ? <Spinner size={14} /> : <Icon name="search" size={14} />}
            Guruhlarni topish
          </button>

          {guruhlar && guruhlar.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {guruhlar.map((g) => (
                <div
                  key={g.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 0',
                    borderBottom: `1px solid ${COLORS.border}`,
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{g.title}</div>
                    <div style={{ color: COLORS.textFaint, fontFamily: 'monospace', fontSize: 11.5 }}>
                      {g.id}
                    </div>
                  </div>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        set(e.target.value, g.id)
                        showToast(`«${g.title}» tanlandi`)
                        e.target.value = ''
                      }
                    }}
                    style={inputStyle({ width: 'auto', minHeight: 30, fontSize: 12 })}
                  >
                    <option value="">Qayerga?</option>
                    {MAYDONLAR.map((m) => (
                      <option key={m.kalit} value={m.kalit}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {!tayyor && !holatYuklanmoqda && (
          <div style={{ marginTop: 16 }}>
            <InfoBanner tone="warning">
              Bot ishlashi uchun Vercel’da muhit o‘zgaruvchilari sozlanishi kerak:
              <br />
              <code>TELEGRAM_BOT_TOKEN</code>, <code>FIREBASE_PROJECT_ID</code>,{' '}
              <code>FIREBASE_CLIENT_EMAIL</code>, <code>FIREBASE_PRIVATE_KEY</code>,{' '}
              <code>CRON_SECRET</code>
              <br />
              Tafsilot README.md da.
            </InfoBanner>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Kichik yordamchilar ────────────────────────────────────── */

function ToggleRow({ nom, izoh, value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: `1px solid ${COLORS.border}`,
        padding: 13,
        borderRadius: UI.radius.control,
        marginBottom: 12,
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{nom}</div>
        <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2 }}>{izoh}</div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}

function HolatQator({ nom, yaxshi, izoh }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0' }}>
      <span style={{ color: yaxshi ? COLORS.success : COLORS.danger, marginTop: 1 }}>
        <Icon name={yaxshi ? 'checkCircle' : 'xCircle'} size={16} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{nom}</div>
        <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 1, wordBreak: 'break-word' }}>
          {izoh}
        </div>
      </div>
    </div>
  )
}
