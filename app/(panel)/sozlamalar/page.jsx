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
import { authErrorMessage } from '@/lib/auth-errors'
import {
  loadSettings,
  saveSettings,
  loadUsers,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '@/lib/db'
import { Icon } from '@/components/icons'
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
      setError(err.message || 'Sozlamalarni yuklab bo‘lmadi')
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
      showToast(err.message || 'Saqlab bo‘lmadi', 'error')
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
      showToast(err.message || 'O‘zgartirib bo‘lmadi', 'error')
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
      showToast(err.message || 'O‘chirib bo‘lmadi', 'error')
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
   3. TELEGRAM (2-BOSQICH)
   ════════════════════════════════════════════════════════════════ */

function TelegramSettings({ settings, onSaved, showToast }) {
  const [form, setForm] = useState(settings.telegram)
  const [busy, setBusy] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function save() {
    setBusy(true)
    try {
      await saveSettings({ telegram: form })
      await onSaved()
      showToast('Telegram sozlamalari saqlandi')
    } catch (err) {
      showToast(err.message || 'Saqlab bo‘lmadi', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={cardStyle({ padding: 18, maxWidth: 600 })}>
      <InfoBanner tone="warning">
        Bot integratsiyasi <strong>2-bosqichda</strong> ishga tushadi. Guruh ID larini hozirdan
        kiritib qo‘yishingiz mumkin — bot ulanganda darhol ishlay boshlaydi.
      </InfoBanner>

      <FormField
        label="Shikoyatlar guruhi (chat ID)"
        hint="Yangi shikoyat kiritilganda shu guruhga yuboriladi"
      >
        <input
          value={form.complaintsChatId}
          onChange={(e) => set('complaintsChatId', e.target.value)}
          placeholder="-1001234567890"
          style={inputStyle()}
        />
      </FormField>

      <FormField label="Davomat guruhi (chat ID)" hint="Xodim kelganda real vaqtda xabar tushadi">
        <input
          value={form.attendanceChatId}
          onChange={(e) => set('attendanceChatId', e.target.value)}
          placeholder="-1001234567890"
          style={inputStyle()}
        />
      </FormField>

      <FormField
        label="Adminlar guruhi (chat ID)"
        hint="Kuniga ikki marta yig‘ma hisobot shu guruhga tushadi"
      >
        <input
          value={form.adminChatId}
          onChange={(e) => set('adminChatId', e.target.value)}
          placeholder="-1001234567890"
          style={inputStyle()}
        />
      </FormField>

      <FormField label="Hisobot vaqtlari" hint="Toshkent vaqti bo‘yicha, kuniga 2 marta">
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1].map((i) => (
            <input
              key={i}
              type="time"
              value={form.reportTimes?.[i] || ''}
              onChange={(e) => {
                const times = [...(form.reportTimes || ['', ''])]
                times[i] = e.target.value
                set('reportTimes', times)
              }}
              style={inputStyle({ flex: 1 })}
            />
          ))}
        </div>
      </FormField>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: `1px solid ${COLORS.border}`,
          padding: 13,
          borderRadius: UI.radius.control,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Botni yoqish</div>
          <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2 }}>
            Bot kodi qo‘shilgandan keyin faollashtiring
          </div>
        </div>
        <Toggle value={!!form.enabled} onChange={(v) => set('enabled', v)} />
      </div>

      <button
        onClick={save}
        disabled={busy}
        className="btn-primary"
        style={primaryButtonStyle({ width: '100%' })}
      >
        {busy ? <Spinner size={15} color="#fff" /> : 'Saqlash'}
      </button>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${COLORS.border}`,
          fontSize: 12,
          color: COLORS.textMuted,
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: COLORS.text }}>Chat ID ni qanday bilish mumkin?</strong>
        <br />
        1. Botni guruhga qo‘shing va administrator qiling
        <br />
        2. Guruhga istalgan xabar yozing
        <br />
        3. Bot tokeni bilan <code>getUpdates</code> so‘rovini yuboring — javobda{' '}
        <code>chat.id</code> ko‘rinadi (guruhlar uchun manfiy son)
      </div>
    </div>
  )
}
