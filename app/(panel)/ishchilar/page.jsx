'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * XODIMLAR — KARTOTEKA VA LAVOZIMLAR
 * ════════════════════════════════════════════════════════════════
 * Xodim qo'shish, tahrirlash, stavka belgilash va login berish —
 * direktor va administratorda. Xodimni butunlay o'chirish ham
 * shu ikkovida, lekin eslatmani o'chirish faqat direktorda.
 * Bu chegaralar firestore.rules da ham takrorlangan.
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/auth-context'
import { COLORS, UI } from '@/lib/constants'
import { formatSom, parseSom, dateKey, formatDate } from '@/lib/utils'
import { normalizeLogin, validateLogin, suggestLogin } from '@/lib/username'
import { createWorkerLogin, setWorkerLoginActive } from '@/lib/worker-auth'
import { authErrorMessage, errorMessage } from '@/lib/auth-errors'
import {
  loadWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  loadPositions,
  createPosition,
  updatePosition,
  deletePosition,
  loadSettings,
  loadWorkerUsers,
  loadNotes,
  createNote,
  deleteNote,
} from '@/lib/db'
import { Icon, resolveIconName, POSITION_ICONS } from '@/components/icons'
import {
  SectionHeader,
  SectionLoading,
  ErrorBanner,
  InfoBanner,
  EmptyState,
  StatCard,
  StatGrid,
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
  IconButton,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  cardStyle,
} from '@/components/ui'

export default function IshchilarPage() {
  const { isDirector, role, profile } = useAuth()

  // Administrator ham kadrlarni boshqaradi: xodim qo‘shadi, tahrirlaydi,
  // stavka belgilaydi, lavozim ochadi va login beradi.
  // Direktorda esa yozuvlarni butunlay o‘chirish va sozlamalar qoladi.
  const canManage = isDirector || role === 'admin'
  const { toast, showToast } = useToast()

  const [workers, setWorkers] = useState([])
  const [positions, setPositions] = useState([])
  const [settings, setSettings] = useState(null)
  const [logins, setLogins] = useState({}) // authUid → users hujjati
  const [notesFor, setNotesFor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [filterPos, setFilterPos] = useState('all')
  const [showInactive, setShowInactive] = useState(false)

  const [editing, setEditing] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showPositions, setShowPositions] = useState(false)

  const refresh = useCallback(async () => {
    setError('')
    try {
      const [w, p, s] = await Promise.all([loadWorkers(), loadPositions(), loadSettings()])
      setWorkers(w)
      setPositions(p)
      setSettings(s)

      // Faqat worker rolidagi profillar — xavfsizlik qoidasi
      // administratorga butun users kolleksiyasini ochmaydi
      const users = await loadWorkerUsers()
      setLogins(Object.fromEntries(users.map((u) => [u.id, u])))
    } catch (err) {
      setError(errorMessage(err, 'Ma’lumotlarni yuklab bo‘lmadi'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const posById = useMemo(() => new Map(positions.map((p) => [p.id, p])), [positions])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return workers.filter((w) => {
      if (!showInactive && w.active === false) return false
      if (filterPos !== 'all' && w.positionId !== filterPos) return false
      if (!q) return true
      return (
        w.name?.toLowerCase().includes(q) ||
        w.phone?.includes(q) ||
        posById.get(w.positionId)?.name?.toLowerCase().includes(q)
      )
    })
  }, [workers, search, filterPos, showInactive, posById])

  const stats = useMemo(() => {
    const active = workers.filter((w) => w.active !== false)
    return {
      jami: active.length,
      nofaol: workers.length - active.length,
      kunlikFond: active.reduce((s, w) => s + (Number(w.dailyRate) || 0), 0),
    }
  }, [workers])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteWorker(confirmDel.id)
      setWorkers((prev) => prev.filter((w) => w.id !== confirmDel.id))
      showToast(`${confirmDel.name} o‘chirildi`)
      setConfirmDel(null)
    } catch (err) {
      showToast(errorMessage(err, 'O‘chirib bo‘lmadi'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <SectionLoading />

  return (
    <div className="animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <SectionHeader
        icon="users"
        title="Xodimlar"
        subtitle={`${stats.jami} ta faol${stats.nofaol ? `, ${stats.nofaol} ta nofaol` : ''}`}
        action={
          canManage && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowPositions(true)}
                className="btn-secondary"
                style={secondaryButtonStyle()}
              >
                <Icon name="briefcase" size={15} />
                Lavozimlar
              </button>
              <button
                onClick={() => setEditing('new')}
                className="btn-primary"
                style={primaryButtonStyle()}
              >
                <Icon name="plus" size={15} />
                Xodim
              </button>
            </div>
          )
        }
      />

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {positions.length === 0 && canManage && (
        <InfoBanner tone="warning">
          Hali birorta lavozim yo‘q. Avval <strong>«Lavozimlar»</strong> orqali lavozim qo‘shing —
          smena vaqti va standart stavka o‘sha yerda belgilanadi.
        </InfoBanner>
      )}

      <StatGrid>
        <StatCard icon="users" label="Faol xodimlar" value={stats.jami} />
        <StatCard icon="briefcase" label="Lavozimlar" value={positions.length} />
        <StatCard
          icon="banknote"
          label="Bir kunlik fond"
          value={formatSom(stats.kunlikFond)}
          sub="hamma kelsa, jarimasiz"
        />
      </StatGrid>

      {/* Filtrlar */}
      <div style={cardStyle({ padding: 12, marginBottom: 16 })}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '2 1 220px' }}>
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
              placeholder="Ism yoki telefon"
              style={inputStyle({ paddingLeft: 34 })}
            />
          </div>

          <select
            value={filterPos}
            onChange={(e) => setFilterPos(e.target.value)}
            style={inputStyle({ flex: '1 1 160px' })}
          >
            <option value="all">Barcha lavozimlar</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 10,
            fontSize: 12.5,
            color: COLORS.textMuted,
          }}
        >
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: COLORS.primary }}
          />
          Nofaol xodimlarni ham ko‘rsatish
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="users"
          title={workers.length === 0 ? 'Xodimlar hali qo‘shilmagan' : 'Hech narsa topilmadi'}
          subtitle={
            workers.length === 0
              ? 'Yuqoridagi «Xodim» tugmasi orqali boshlang'
              : 'Filtrlarni o‘zgartirib ko‘ring'
          }
        />
      ) : (
        <div style={cardStyle({ overflow: 'hidden' })}>
          {filtered.map((w, i) => {
            const p = posById.get(w.positionId)
            const inactive = w.active === false
            return (
              <div
                key={w.id}
                className="row-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 13px',
                  borderBottom: i === filtered.length - 1 ? 'none' : `1px solid ${COLORS.border}`,
                  opacity: inactive ? 0.5 : 1,
                }}
              >
                <Avatar name={w.name} size={34} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      flexWrap: 'wrap',
                    }}
                  >
                    {w.name}
                    {inactive && <Badge>nofaol</Badge>}
                    {w.username && (
                      <Badge
                        icon="key"
                        color={
                          logins[w.authUid] && logins[w.authUid].active === false
                            ? COLORS.textMuted
                            : COLORS.info
                        }
                      >
                        {w.username}
                      </Badge>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: COLORS.textMuted,
                      marginTop: 3,
                      display: 'flex',
                      gap: 11,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name={resolveIconName(p?.icon)} size={12} />
                      {p?.name || 'Lavozimsiz'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="clock" size={12} />
                      {w.shiftStart || p?.shiftStart || settings?.defaultShiftStart}
                    </span>
                    <span style={{ color: COLORS.text, fontWeight: 600 }}>
                      {formatSom(w.dailyRate)} so‘m
                    </span>
                    {w.phone && <span>{w.phone}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <IconButton icon="note" title="Eslatmalar" onClick={() => setNotesFor(w)} />
                  {canManage && (
                    <>
                      <IconButton icon="pencil" title="Tahrirlash" onClick={() => setEditing(w)} />
                      <IconButton
                        icon="trash"
                        title="O‘chirish"
                        color={COLORS.danger}
                        onClick={() => setConfirmDel(w)}
                      />
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <WorkerModal
          worker={editing === 'new' ? null : editing}
          positions={positions}
          settings={settings}
          loginDoc={editing !== 'new' ? logins[editing.authUid] : null}
          onClose={() => setEditing(null)}
          onSaved={async (msg) => {
            setEditing(null)
            showToast(msg)
            await refresh()
          }}
        />
      )}

      {notesFor && (
        <NotesModal
          worker={notesFor}
          authorName={profile?.name}
          authorUid={profile?.id}
          canDelete={isDirector}
          onClose={() => setNotesFor(null)}
          showToast={showToast}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          title="Xodimni o‘chirish"
          message={`${confirmDel.name} butunlay o‘chiriladi. O‘tgan oylardagi davomat yozuvlari saqlanib qoladi. Xodim ishdan bo‘shagan bo‘lsa, o‘chirish o‘rniga uni «nofaol» qilib qo‘yish tavsiya etiladi.`}
          confirmLabel="O‘chirish"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {showPositions && (
        <PositionsModal
          positions={positions}
          workers={workers}
          onClose={() => setShowPositions(false)}
          onChanged={refresh}
          showToast={showToast}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   XODIM FORMASI
   ════════════════════════════════════════════════════════════════ */

function WorkerModal({ worker, positions, settings, loginDoc, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: worker?.name || '',
    positionId: worker?.positionId || positions[0]?.id || '',
    dailyRate: worker?.dailyRate ?? positions[0]?.defaultRate ?? 0,
    phone: worker?.phone || '',
    shiftStart: worker?.shiftStart || '',
    active: worker?.active !== false,
    note: worker?.note || '',
  })

  // Kirish huquqi — xodimda hali login bo'lmasa taklif qilinadi
  const hasLogin = !!worker?.username
  const [grantLogin, setGrantLogin] = useState(false)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loginActive, setLoginActive] = useState(loginDoc?.active !== false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const selectedPos = positions.find((p) => p.id === form.positionId)

  /** Lavozim almashganda stavkani o'sha lavozim standartiga tenglaymiz —
   *  faqat yangi xodim qo'shilayotganda; tahrirlashda tegmaymiz */
  function changePosition(id) {
    const p = positions.find((x) => x.id === id)
    setForm((f) => ({
      ...f,
      positionId: id,
      dailyRate: worker ? f.dailyRate : (p?.defaultRate ?? f.dailyRate),
    }))
  }

  async function handleSave() {
    setError('')
    if (!form.name.trim()) return setError('Ismni kiriting')
    if (!form.positionId) return setError('Lavozimni tanlang')
    if (!form.dailyRate || form.dailyRate <= 0) return setError('Kunlik stavkani kiriting')

    if (grantLogin) {
      const loginError = validateLogin(login)
      if (loginError) return setError(loginError)
      if (password.length < 6) return setError('Parol kamida 6 ta belgidan iborat bo‘lsin')
    }

    setBusy(true)
    try {
      const data = {
        name: form.name.trim(),
        positionId: form.positionId,
        dailyRate: Number(form.dailyRate),
        phone: form.phone.trim(),
        shiftStart: form.shiftStart || null,
        active: form.active,
        note: form.note.trim(),
      }

      let workerId = worker?.id

      if (worker) {
        await updateWorker(worker.id, data)
      } else {
        workerId = await createWorker(data)
      }

      // Login yaratish — xodim hujjati mavjud bo'lgandan keyin,
      // chunki users hujjatiga workerId yozilishi kerak
      if (grantLogin) {
        await createWorkerLogin({
          workerId,
          workerName: data.name,
          login,
          password,
        })
      }

      // Mavjud loginning holati o'zgartirilgan bo'lsa
      if (hasLogin && loginDoc && loginActive !== (loginDoc.active !== false)) {
        await setWorkerLoginActive(worker.authUid, loginActive)
      }

      await onSaved(
        worker ? 'Xodim ma’lumoti yangilandi' : `${data.name} qo‘shildi`
      )
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Modal title={worker ? 'Xodimni tahrirlash' : 'Yangi xodim'} onClose={onClose}>
      <FormField label="To‘liq ism">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Aziz Karimov"
          style={inputStyle()}
        />
      </FormField>

      <FormField label="Lavozim">
        <select
          value={form.positionId}
          onChange={(e) => changePosition(e.target.value)}
          style={inputStyle()}
        >
          <option value="">— tanlang —</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </FormField>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <FormField
            label="Kunlik stavka (so‘m)"
            hint={selectedPos ? `Standart: ${formatSom(selectedPos.defaultRate)}` : null}
          >
            <input
              inputMode="numeric"
              value={formatSom(form.dailyRate)}
              onChange={(e) => setForm((f) => ({ ...f, dailyRate: parseSom(e.target.value) }))}
              style={inputStyle()}
            />
          </FormField>
        </div>

        <div style={{ flex: 1 }}>
          <FormField
            label="Smena boshlanishi"
            hint={`Bo‘sh — lavozim vaqti: ${
              selectedPos?.shiftStart || settings?.defaultShiftStart || '09:00'
            }`}
          >
            <input
              type="time"
              value={form.shiftStart}
              onChange={(e) => setForm((f) => ({ ...f, shiftStart: e.target.value }))}
              style={inputStyle()}
            />
          </FormField>
        </div>
      </div>

      <FormField label="Telefon">
        <input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+998 90 123 45 67"
          style={inputStyle()}
        />
      </FormField>

      <FormField label="Izoh">
        <textarea
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          rows={2}
          style={inputStyle({ minHeight: 58, resize: 'vertical', padding: '9px 12px' })}
        />
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
          <div style={{ fontSize: 13, fontWeight: 600 }}>Faol xodim</div>
          <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2 }}>
            Nofaol xodim davomat ro‘yxatida ko‘rinmaydi
          </div>
        </div>
        <Toggle value={form.active} onChange={(v) => setForm((f) => ({ ...f, active: v }))} />
      </div>

      {/* ─── Shaxsiy kabinetga kirish ─── */}
      <div
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: UI.radius.control,
          padding: 13,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ color: COLORS.textMuted }}>
            <Icon name="key" size={15} />
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Shaxsiy kabinet</span>
        </div>

        {hasLogin ? (
          <>
            <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.55 }}>
              Login: <strong style={{ color: COLORS.text }}>{worker.username}</strong> — xodim shu
              bilan o‘z oyligi va davomatini ko‘radi.
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid ${COLORS.border}`,
              }}
            >
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Kirishga ruxsat</div>
                <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2 }}>
                  O‘chirsangiz xodim kabinetga kira olmaydi
                </div>
              </div>
              <Toggle value={loginActive} onChange={setLoginActive} />
            </div>

            <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 10, lineHeight: 1.55 }}>
              Parolni xodimning o‘zi kabinetdan o‘zgartiradi. Parolni unutgan bo‘lsa — hozircha
              yangi login berish kerak.
            </div>
          </>
        ) : grantLogin ? (
          <>
            <FormField label="Login" hint="Takrorlanmas bo‘lishi shart. Xodimga aytib qo‘ying">
              <input
                value={login}
                onChange={(e) => setLogin(normalizeLogin(e.target.value))}
                placeholder={suggestLogin(form.name) || 'aziz.karimov'}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                style={inputStyle()}
              />
            </FormField>

            <FormField label="Parol" hint="Kamida 6 ta belgi">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle()}
              />
            </FormField>

            <button
              onClick={() => {
                setGrantLogin(false)
                setLogin('')
                setPassword('')
              }}
              className="btn-secondary"
              style={secondaryButtonStyle({ width: '100%', minHeight: 34 })}
            >
              Bekor qilish
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.55, marginBottom: 10 }}>
              Xodimga login va parol bersangiz, u o‘z oyligi, jarimalari va davomat jadvalini
              telefonidan ko‘rib turadi.
            </div>
            <button
              onClick={() => {
                setGrantLogin(true)
                setLogin(suggestLogin(form.name))
              }}
              className="btn-secondary"
              style={secondaryButtonStyle({ width: '100%', minHeight: 34 })}
            >
              <Icon name="plus" size={14} />
              Kirish huquqi berish
            </button>
          </>
        )}
      </div>

      <FormError message={error} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onClose}
          disabled={busy}
          className="btn-secondary"
          style={secondaryButtonStyle({ flex: 1 })}
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSave}
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

const arrowStyle = {
  width: 20,
  height: 16,
  padding: 0,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 4,
  background: COLORS.surface,
  color: COLORS.textMuted,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

/* ════════════════════════════════════════════════════════════════
   ESLATMALAR JURNALI
   ════════════════════════════════════════════════════════════════
   Direktor va administrator xodimga sanali eslatma yozadi.
   Xodim ularni o'z kabinetida o'qiydi, lekin o'chira olmaydi —
   shuning uchun yozishdan oldin o'ylab ko'rish kerak.
   ════════════════════════════════════════════════════════════════ */

function NotesModal({ worker, authorName, authorUid, canDelete, onClose, showToast }) {
  const [notes, setNotes] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setNotes(await loadNotes(worker.id))
    } catch (err) {
      showToast(errorMessage(err, 'Eslatmalarni yuklab bo‘lmadi'), 'error')
    } finally {
      setLoading(false)
    }
  }, [worker.id, showToast])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function add() {
    if (text.trim().length < 3) return
    setBusy(true)
    try {
      await createNote({
        workerId: worker.id,
        text: text.trim(),
        date: dateKey(),
        authorName: authorName || '—',
        authorUid: authorUid || null,
      })
      setText('')
      await refresh()
      showToast('Eslatma qo‘shildi')
    } catch (err) {
      showToast(errorMessage(err, 'Saqlab bo‘lmadi'), 'error')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    setBusy(true)
    try {
      await deleteNote(id)
      await refresh()
      showToast('Eslatma o‘chirildi')
    } catch (err) {
      showToast(errorMessage(err, 'O‘chirib bo‘lmadi'), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={`Eslatmalar — ${worker.name}`} onClose={onClose} width={520}>
      <InfoBanner>
        Bu eslatmalarni xodim <strong>o‘z kabinetida ko‘radi</strong>. Ular sanasi bilan saqlanadi
        va o‘chirilmaguncha turadi.
      </InfoBanner>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Masalan: mijoz bilan qo‘pol gaplashdi"
          style={inputStyle({ flex: 1 })}
        />
        <button
          onClick={add}
          disabled={busy || text.trim().length < 3}
          className="btn-primary"
          style={primaryButtonStyle()}
        >
          {busy ? <Spinner size={15} color="#fff" /> : 'Qo‘shish'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spinner size={20} />
        </div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: COLORS.textFaint, fontSize: 13 }}>
          Hali eslatma yo‘q
        </div>
      ) : (
        notes.map((n) => (
          <div
            key={n.id}
            style={{
              display: 'flex',
              gap: 11,
              padding: '11px 2px',
              borderBottom: `1px solid ${COLORS.border}`,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{n.text}</div>
              <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 4 }}>
                {formatDate(n.date)} · {n.authorName}
              </div>
            </div>
            {canDelete && (
              <IconButton
                icon="trash"
                title="O‘chirish"
                size={28}
                color={COLORS.danger}
                disabled={busy}
                onClick={() => remove(n.id)}
              />
            )}
          </div>
        ))
      )}
    </Modal>
  )
}

/* ════════════════════════════════════════════════════════════════
   LAVOZIMLAR
   ════════════════════════════════════════════════════════════════ */

function PositionsModal({ positions, workers, onClose, onChanged, showToast }) {
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)

  const counts = useMemo(() => {
    const map = {}
    for (const w of workers) map[w.positionId] = (map[w.positionId] || 0) + 1
    return map
  }, [workers])

  async function save() {
    if (!form.name?.trim()) return
    setBusy(true)
    try {
      const data = {
        name: form.name.trim(),
        icon: form.icon || 'user',
        shiftStart: form.shiftStart || '09:00',
        defaultRate: Number(form.defaultRate) || 0,
        order: form.order ?? positions.length + 1,
      }
      if (form.id) await updatePosition(form.id, data)
      else await createPosition(data)

      setForm(null)
      await onChanged()
      showToast(form.id ? 'Lavozim yangilandi' : 'Lavozim qo‘shildi')
    } catch (err) {
      showToast(errorMessage(err, 'Saqlab bo‘lmadi'), 'error')
    } finally {
      setBusy(false)
    }
  }

  /**
   * Lavozimni ro'yxatda yuqoriga/pastga suradi.
   * Ikkala hujjatning `order` qiymati almashtiriladi — davomat
   * sahifasidagi guruhlar tartibi ham shunga qarab o'zgaradi.
   */
  async function move(index, delta) {
    const a = positions[index]
    const b = positions[index + delta]
    if (!a || !b) return

    setBusy(true)
    try {
      // Tartib raqamlari teng bo'lib qolgan bo'lsa (eski ma'lumot),
      // almashtirish ish bermaydi — shuning uchun indeksdan foydalanamiz
      await Promise.all([
        updatePosition(a.id, { order: index + delta + 1 }),
        updatePosition(b.id, { order: index + 1 }),
      ])
      await onChanged()
    } catch (err) {
      showToast(errorMessage(err, 'Tartibni o‘zgartirib bo‘lmadi'), 'error')
    } finally {
      setBusy(false)
    }
  }

  async function remove(p) {
    if (counts[p.id]) {
      showToast(`«${p.name}» lavozimida ${counts[p.id]} ta xodim bor`, 'error')
      return
    }
    setBusy(true)
    try {
      await deletePosition(p.id)
      await onChanged()
      showToast('Lavozim o‘chirildi')
    } catch (err) {
      showToast(errorMessage(err, 'O‘chirib bo‘lmadi'), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Lavozimlar" onClose={onClose}>
      <InfoBanner>
        Har bir lavozim uchun <strong>smena boshlanish vaqti</strong> va{' '}
        <strong>standart kunlik stavka</strong> belgilanadi. Kechikish shu vaqtdan hisoblanadi.
      </InfoBanner>

      {form ? (
        <div
          style={{
            border: `1px solid ${COLORS.border}`,
            padding: 14,
            borderRadius: UI.radius.control,
            marginBottom: 16,
          }}
        >
          <FormField label="Nomi">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Masalan: Barmen"
              style={inputStyle()}
            />
          </FormField>

          <FormField label="Ikona">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {POSITION_ICONS.map((name) => {
                const active = form.icon === name
                return (
                  <button
                    key={name}
                    onClick={() => setForm((f) => ({ ...f, icon: name }))}
                    aria-label={name}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: UI.radius.chip,
                      border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
                      background: active ? COLORS.primarySoft : COLORS.surface,
                      color: active ? COLORS.primary : COLORS.textMuted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={name} size={17} />
                  </button>
                )
              })}
            </div>
          </FormField>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <FormField label="Smena boshlanishi">
                <input
                  type="time"
                  value={form.shiftStart}
                  onChange={(e) => setForm((f) => ({ ...f, shiftStart: e.target.value }))}
                  style={inputStyle()}
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Standart stavka">
                <input
                  inputMode="numeric"
                  value={formatSom(form.defaultRate)}
                  onChange={(e) => setForm((f) => ({ ...f, defaultRate: parseSom(e.target.value) }))}
                  style={inputStyle()}
                />
              </FormField>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setForm(null)}
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
        </div>
      ) : (
        <button
          onClick={() =>
            setForm({ name: '', icon: 'user', shiftStart: '09:00', defaultRate: 100000 })
          }
          className="btn-secondary"
          style={secondaryButtonStyle({ width: '100%', marginBottom: 16 })}
        >
          <Icon name="plus" size={15} />
          Yangi lavozim
        </button>
      )}

      {positions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: COLORS.textMuted, fontSize: 13 }}>
          Lavozimlar yo‘q
        </div>
      ) : (
        positions.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '10px 2px',
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button
                onClick={() => move(i, -1)}
                disabled={busy || i === 0}
                aria-label="Yuqoriga"
                title="Yuqoriga"
                style={arrowStyle}
              >
                <Icon name="chevronRight" size={12} style={{ transform: 'rotate(-90deg)' }} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={busy || i === positions.length - 1}
                aria-label="Pastga"
                title="Pastga"
                style={arrowStyle}
              >
                <Icon name="chevronRight" size={12} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>

            <span style={{ color: COLORS.textMuted }}>
              <Icon name={resolveIconName(p.icon)} size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2 }}>
                {p.shiftStart} · {formatSom(p.defaultRate)} so‘m · {counts[p.id] || 0} xodim
              </div>
            </div>
            <IconButton icon="pencil" title="Tahrirlash" onClick={() => setForm(p)} />
            <IconButton
              icon="trash"
              title="O‘chirish"
              color={COLORS.danger}
              disabled={busy}
              onClick={() => remove(p)}
            />
          </div>
        ))
      )}
    </Modal>
  )
}
