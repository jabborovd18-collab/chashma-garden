'use client'

/**
 * ════════════════════════════════════════════════════════════════
 * DASTLABKI SOZLASH — BIRINCHI DIREKTOR HISOBI
 * ════════════════════════════════════════════════════════════════
 * "Tovuqmi-tuxummi" muammosini hal qiladi: xavfsizlik qoidalariga
 * ko'ra foydalanuvchi yaratishni faqat direktor qila oladi, lekin
 * birinchi direktorni kim yaratadi?
 *
 * Yechim: settings/app hujjati mavjud bo'lmaguncha "darvoza" ochiq.
 * Shu sahifa birinchi direktorni va settings/app hujjatini bitta
 * tranzaksiyada yozadi — shundan keyin darvoza abadiy yopiladi.
 * ════════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUserWithEmailAndPassword, deleteUser, signOut } from 'firebase/auth'
import { doc, writeBatch, collection, serverTimestamp } from 'firebase/firestore'
import { getAuthClient, getDb } from '@/firebase/config'
import { COLORS, DEFAULT_SETTINGS, SEED_POSITIONS, UI } from '@/lib/constants'
import { loginToEmail, normalizeLogin, validateLogin, suggestLogin } from '@/lib/username'
import { authErrorMessage } from '@/lib/auth-errors'
import { Icon } from '@/components/icons'
import { Spinner, FormError, InfoBanner, inputStyle, primaryButtonStyle } from '@/components/ui'

export default function SozlashPage() {
  const router = useRouter()

  const [form, setForm] = useState({ name: '', login: '', password: '', password2: '' })
  const [loginTouched, setLoginTouched] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  /** Ism yozilganda login o'zi taklif qilinadi — foydalanuvchi
   *  loginni qo'lda tahrirlagan bo'lsa, aralashmaymiz */
  function changeName(e) {
    const name = e.target.value
    setForm((f) => ({ ...f, name, login: loginTouched ? f.login : suggestLogin(name) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Ismingizni kiriting')

    const loginError = validateLogin(form.login)
    if (loginError) return setError(loginError)

    if (form.password.length < 6) return setError('Parol kamida 6 ta belgidan iborat bo‘lsin')
    if (form.password !== form.password2) return setError('Parollar mos kelmadi')

    setBusy(true)
    let created = null

    try {
      const auth = getAuthClient()
      const db = getDb()

      const cred = await createUserWithEmailAndPassword(
        auth,
        loginToEmail(form.login),
        form.password
      )
      created = cred.user

      // Direktor profili + sozlamalar — bitta tranzaksiyada.
      // Qoidalar tranzaksiyadan OLDINGI holatga qaraydi, shuning
      // uchun ikkalasi ham o'tadi. Keyin darvoza yopiladi.
      const batch = writeBatch(db)

      batch.set(doc(db, 'users', cred.user.uid), {
        name: form.name.trim(),
        username: form.login,
        role: 'director',
        active: true,
        createdAt: serverTimestamp(),
      })

      batch.set(doc(db, 'settings', 'app'), {
        ...DEFAULT_SETTINGS,
        restaurantName: 'Chashma Garden',
        createdAt: serverTimestamp(),
      })

      await batch.commit()

      // Boshlang'ich lavozimlar — endi direktor sifatida yozamiz
      const posBatch = writeBatch(db)
      for (const p of SEED_POSITIONS) {
        posBatch.set(doc(collection(db, 'positions')), { ...p, createdAt: serverTimestamp() })
      }
      await posBatch.commit()

      setDone(true)
      setTimeout(() => router.replace('/davomat'), 1500)
    } catch (err) {
      // Profil yozilmasa, yaratilgan Auth hisobini ham qaytarib olamiz —
      // aks holda hech qanday ruxsatga ega bo'lmagan "yetim" hisob qoladi
      if (created) {
        try {
          await deleteUser(created)
        } catch {
          await signOut(getAuthClient()).catch(() => {})
        }
      }

      setError(
        err?.code === 'permission-denied'
          ? 'Tizim allaqachon sozlangan. Kirish sahifasidan foydalaning.'
          : authErrorMessage(err)
      )
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: COLORS.bg,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div
          style={{
            textAlign: 'center',
            marginBottom: 22,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ color: COLORS.primary }}>
            <Icon name="leaf" size={28} strokeWidth={1.5} />
          </span>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 600 }}>Dastlabki sozlash</h1>
            <p style={{ fontSize: 12.5, color: COLORS.textMuted, marginTop: 3 }}>
              Birinchi direktor hisobini yarating
            </p>
          </div>
        </div>

        {done ? (
          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: UI.radius.card,
              padding: 30,
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', color: COLORS.success }}>
              <Icon name="checkCircle" size={34} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: 16.5, marginTop: 14 }}>Tayyor</h2>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8, lineHeight: 1.6 }}>
              Direktor hisobi yaratildi, lavozimlar bazaga yozildi.
              <br />
              Panelga o‘tkazilmoqdasiz.
            </p>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
              <Spinner size={20} />
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: UI.radius.card,
              padding: 22,
            }}
          >
            <InfoBanner tone="warning">
              Bu sahifa <strong>faqat bir marta</strong> ishlaydi. Birinchi hisob yaratilgach
              yopiladi va keyingi foydalanuvchilarni siz panel ichidan qo‘shasiz.
            </InfoBanner>

            <Field label="To‘liq ism">
              <input
                value={form.name}
                onChange={changeName}
                placeholder="Dilshod Jabborov"
                style={inputStyle()}
              />
            </Field>

            <Field label="Login" hint="Tizimga shu bilan kirasiz. Kichik lotin harflari, raqam va . _ -">
              <input
                value={form.login}
                onChange={(e) => {
                  setLoginTouched(true)
                  setForm((f) => ({ ...f, login: normalizeLogin(e.target.value) }))
                }}
                placeholder="dilshod.jabborov"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                style={inputStyle()}
              />
            </Field>

            <Field label="Parol">
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Kamida 6 ta belgi"
                style={inputStyle()}
              />
            </Field>

            <Field label="Parolni takrorlang">
              <input
                type="password"
                value={form.password2}
                onChange={set('password2')}
                style={inputStyle()}
              />
            </Field>

            <FormError message={error} />

            <button
              type="submit"
              disabled={busy}
              className="btn-primary"
              style={primaryButtonStyle({ width: '100%' })}
            >
              {busy ? <Spinner size={16} color="#fff" /> : 'Tizimni ishga tushirish'}
            </button>
          </form>
        )}

        {!done && (
          <p style={{ fontSize: 12, color: COLORS.textFaint, textAlign: 'center', marginTop: 16 }}>
            Hisobingiz bormi?{' '}
            <Link href="/login" style={{ color: COLORS.primary, fontWeight: 600 }}>
              Kirish
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12.5,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 5, lineHeight: 1.5 }}>
          {hint}
        </div>
      )}
    </div>
  )
}
