# 🌿 Chashma Garden — Davomat va oylik nazorat tizimi

Restoran xodimlarining kunlik davomatini yuritish, kechikish jarimalarini
avtomatik hisoblash va oylik maoshni chiqarish uchun ichki panel.

**Texnologiyalar:** Next.js 16 (App Router) · React 19 · Firebase (Auth + Firestore) · Tailwind CSS v4

---

## Nima qiladi

| Bo'lim | Vazifasi |
|---|---|
| 📋 **Davomat** | Hostes/administrator xodim kelganda «Keldi» tugmasini bosadi. Vaqt, kechikish va jarima avtomatik hisoblanadi |
| 👥 **Xodimlar** | Kartoteka: ism, lavozim, kunlik stavka, smena vaqti, telefon, eslatmalar, kabinet logini |
| 📣 **Shikoyatlar** | Mijoz shikoyatlari qayd etiladi — majlisda muhokama qilish uchun |
| 💰 **Oylik** | Har bir xodim bo'yicha: ishlagan kunlar − jarimalar − avanslar = to'lanadigan summa |
| 💵 **Kassa** | Kassir uchun: kimga qancha berilishi, berilgani, qolgani. Xodim zimmasiga summa yozish |
| ⚙️ **Sozlamalar** | Jarima qoidalari, panel foydalanuvchilari, Telegram sozlamalari |
| 👤 **Xodim kabineti** | Xodim o'z login-paroli bilan kiradi: oylik yakuni, oxirgi 14 kunlik davomat, eslatmalar |

### Hisoblash formulasi

```
kunlik daromad = kunlik stavka − kechikish jarimasi
oylik          = Σ kunlik daromad − avanslar − ushlanmalar
qolgan         = oylik − kassir bergan to'lovlar
```

Kechikish jarimasi ikki xil hisoblanishi mumkin (Sozlamalarda tanlanadi):

- **Pog'onali** — kechikish darajasiga qarab kunlik stavkadan foiz ushlanadi
  (standart: 0 daq → 10%, 30 daq → 25%, 60 daq → 50%)
- **Daqiqalik** — har kechikkan daqiqa uchun qat'iy summa

Ikkala rejimda ham **erkinlik vaqti** (standart 10 daqiqa) mavjud — undan
kam kechikish jarimasiz kechiriladi.

---

## O'rnatish

### 1. Firebase loyihasini yarating

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. **Build → Authentication → Get started → Sign-in method** → **Email/Password** ni yoqing
3. **Build → Firestore Database → Create database** → rejim: *production*
4. **Project Settings → Your apps → Web (`</>`)** → ilova qo'shing va konfiguratsiyani nusxalang

### 2. `.env.local` faylini yarating

Loyiha ildizida `.env.local` fayl yarating (`.env.local.example` dan nusxa oling):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> Bu fayl `.gitignore` da — hech qachon git'ga tushmaydi.

### 3. Xavfsizlik qoidalarini joylang

Firestore qoidalari **majburiy** — ularsiz maosh ma'lumotlari ochiq qoladi.

Ikki yo'l bor.

**Firebase CLI orqali** (tavsiya) — bir marta sozlansa, keyin bitta buyruq:

```bash
npm install -g firebase-tools
```

```bash
firebase login
```

```bash
firebase deploy --only firestore:rules
```

**Yoki qo'lda:** Firebase Console → **Firestore Database → Rules** bo'limiga
[`firestore.rules`](firestore.rules) mazmunini ko'chiring va **Publish** bosing.

> Qoidalar har o'zgarganda qayta joylash kerak. Yangi kolleksiya qo'shilib
> qoidasi joylanmasa, u avtomatik yopiq qoladi va sahifa «ruxsat yo'q» deydi.

> `storage.rules` bu loyihada ishlatilmaydi — Firebase Storage yoqilmagan.
> Fayl kelajak uchun, butunlay yopiq holatda saqlanib turibdi.

### 4. Ishga tushiring

```bash
npm install
```

```bash
npm run dev
```

### 5. Birinchi direktor hisobini yarating

Brauzerda **http://localhost:3000/sozlash** ni oching va formani to'ldiring
(ism, login, parol).

Bu sahifa faqat **bir marta** ishlaydi: birinchi direktor yaratilgach
o'zini yopadi va boshqa hech kim undan foydalana olmaydi. Keyingi
foydalanuvchilarni **Sozlamalar → Foydalanuvchilar** bo'limidan qo'shasiz.

Sozlash jarayonida 5 ta standart lavozim (afitsant, raner, salatchi,
oshpaz, zakadovkachi) bazaga avtomatik yoziladi. Ularni keyin
**Xodimlar → Lavozimlar** bo'limida tahrirlaysiz: nomi, smena vaqti,
standart stavka, ikonasi va ro'yxatdagi tartibi.

> Kassir bu ro'yxatda yo'q — u davomati yuritiladigan zal xodimi emas,
> panelning alohida roli.

---

## Rollar

| Rol | Huquqlari |
|---|---|
| 👑 **Direktor** | Hamma narsa. Faqat unda: sozlamalar, jarima qoidalari, panel foydalanuvchilari va yozuvlarni **o'chirish** (davomat, avans, eslatma) |
| 🗂️ **Administrator** | Kundalik boshqaruv: xodim qo'shish/tahrirlash, stavka, lavozimlar, login berish, davomat, shikoyat, avans, eslatma, oylik hisobot |
| 💵 **Kassir** | Kassa bo'limi: pulni beradi, ushlanma yozadi, jarima va oylikni ko'radi. Xodim qo'sha olmaydi |
| 🎀 **Hostes** | Faqat davomat belgilash va shikoyat kiritish |
| 👤 **Xodim** | Nazorat paneliga kirmaydi. Faqat `/kabinet` — o'z oyligi va davomati |

Rollar Firestore'dagi `users/{uid}` hujjatida saqlanadi va
[`firestore.rules`](firestore.rules) tomonidan server darajasida
tekshiriladi — brauzerdagi kod orqali chetlab o'tib bo'lmaydi.

Xodim rolida `workerId` maydoni bo'ladi — u xodimni o'z kartochkasiga
bog'laydi. Xavfsizlik qoidalari shu id ni tekshiradi, shuning uchun
xodim boshqa birovning maoshini **hech qanday yo'l bilan** ko'ra olmaydi.

## Login va parol

Tizim **email ishlatmaydi** — kirish uchun login va parol beriladi
(`aziz.karimov`). Firebase Auth username'ni qo'llab-quvvatlamagani
sababli login ichki ravishda `aziz.karimov@chashma.local` ko'rinishiga
o'giriladi. Foydalanuvchi buni ko'rmaydi, xat ham yuborilmaydi.

Bu yondashuv parolni shifrlash, parol topishga urinishlarni bloklash
va seansni himoyalashni Firebase zimmasida qoldiradi.

Xodimga login berish: **Xodimlar → xodimni tahrirlash → «Kirish huquqi
berish»**. Login va parolni o'zingiz belgilaysiz va xodimga aytasiz.
Xodim keyin parolini kabinetdan o'zgartira oladi.

> **Parolni unutgan xodim.** Boshqa foydalanuvchining parolini
> brauzerdan tiklab bo'lmaydi — buning uchun server tomonida Firebase
> Admin SDK kerak. U Telegram bosqichida qo'shiladi. Hozircha yechim:
> xodimga yangi login berish.

---

## Loyiha tuzilishi

```
app/
├─ layout.js              Root layout + AuthProvider
├─ page.js                / → /davomat ga yo'naltiradi
├─ login/                 Kirish (login + parol)
├─ sozlash/               Birinchi direktor (bir martalik)
├─ kabinet/               Xodimning shaxsiy kabineti
└─ (panel)/               Himoyalangan bo'limlar
   ├─ layout.jsx          Auth guard + navigatsiya
   ├─ davomat/
   ├─ ishchilar/
   ├─ shikoyatlar/
   ├─ kassa/
   ├─ hisobot/
   └─ sozlamalar/

components/
├─ ui.jsx                 Umumiy UI (Modal, Toast, Badge, ...)
├─ icons.jsx              Barcha SVG ikonalar
└─ auth-context.jsx       Seans va rol konteksti

lib/
├─ constants.js           Ranglar, rollar, holatlar, standart sozlamalar
├─ utils.js               Sana/vaqt/pul formatlash (Toshkent vaqti)
├─ payroll.js             ⭐ Kechikish, jarima, oylik hisobi
├─ db.js                  Firestore murojaatlari
├─ username.js            Login ↔ email o'girish
├─ worker-auth.js         Xodimga login berish, parol o'zgartirish
└─ auth-errors.js         Firebase xatolarini o'zbekchaga o'girish

firebase/config.js        Firebase ulanishi
firestore.rules           ⭐ Xavfsizlik qoidalari
```

### Firestore kolleksiyalari

| Kolleksiya | Mazmuni |
|---|---|
| `users/{uid}` | Foydalanuvchilar, rollari va loginlari (`workerId` — xodimlar uchun) |
| `workers` | Xodimlar: ism, lavozim, kunlik stavka, telefon, `username`, `authUid` |
| `positions` | Lavozimlar: smena vaqti, standart stavka |
| `attendance` | Kunlik davomat. Hujjat id: `YYYY-MM-DD_workerId` |
| `advances` | Avanslar (oylikdan ushlab qolinadi) |
| `charges` | Xodim zimmasiga yozilgan summa: singan idish, kam chiqqan kassa |
| `payouts` | Kassir bergan to'lovlar |
| `notes` | Xodimga yozilgan sanali eslatmalar — kabinetda ko'rinadi |
| `complaints` | Mijoz shikoyatlari (xodim ko'rmaydi) |
| `settings/app` | Jarima qoidalari, Telegram sozlamalari |

> **Davomat yozuvi nega stavkani ichida saqlaydi?**
> Xodimning stavkasi keyinchalik oshsa, o'tgan oylarning hisoboti
> o'zgarib ketmasligi kerak. Shuning uchun har bir yozuvda o'sha
> kundagi stavka, kechikish va jarima summasi ko'chirib saqlanadi.

---

## Keyingi bosqich — Telegram bot

Hozircha panel to'liq ishlaydi, bot integratsiyasi qo'shilmagan. Rejalashtirilgan:

1. **Shikoyatlar guruhi** — saytga kiritilgan shikoyat darhol guruhga yuboriladi
2. **Davomat guruhi** — xodim kelganda real vaqtda xabar
3. **Adminlar guruhi** — kuniga 2 marta yig'ma hisobot
   (`13:00 holatiga: afitsant 28/32, oshpaz 7/8, salatchi 4/5`)

Guruh chat ID larini hozirdan **Sozlamalar → Telegram** bo'limiga
kiritib qo'yish mumkin.

Bot uchun qo'shimcha kerak bo'ladi: Firebase Admin SDK (server tomoni),
`/api/telegram/webhook` marshruti va tashqi cron (Vercel Hobby tarifida
cron kuniga 1 marta ishlaydi — 2 marta hisobot uchun `cron-job.org`
kabi bepul xizmat yoki Vercel Pro kerak).

---

## Eslatma

`_backup/admin-menu-panel.jsx` — loyihaning eski menyu boshqaruv paneli.
Yangi tizimda ishlatilmaydi, arxiv sifatida saqlangan. Kerak bo'lmasa
o'chirib tashlashingiz mumkin. Menyu sahifalari git tarixida:

```bash
git show 6e69773 --stat
```
