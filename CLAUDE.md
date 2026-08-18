# Chashma Garden — loyiha qoidalari

Restoran xodimlari davomati va oylik hisob-kitob tizimi.
Next.js 16 (App Router) · React 19 · Firebase (Auth + Firestore) · JavaScript.

Bu fayl — loyihada ishlaydigan har qanday agent yoki dasturchi uchun
**majburiy qoidalar**. Kod yozishdan oldin o'qing.

---

## 1. Dizayn qoidalari — QAT'IY

### 1.1 Emoji ishlatilmaydi

**Interfeysda emoji qat'iyan taqiqlanadi.** Na tugmada, na sarlavhada,
na holat belgisida, na `placeholder` matnida, na `toast` xabarida.

Sabab: emoji operatsion tizimga qarab har xil ko'rinadi, o'lchami va
og'irligi matn bilan mos tushmaydi, chop etishda buziladi va mahsulotga
"shoshib yig'ilgan" tus beradi.

```jsx
// ❌ NOTO'G'RI
<button>✅ Keldi</button>
<h2>📋 Davomat</h2>
showToast('✅ Saqlandi')

// ✅ TO'G'RI
<button><Icon name="check" size={16} /> Keldi</button>
<SectionHeader icon="attendance" title="Davomat" />
showToast('Saqlandi')
```

Yagona istisno: `README.md` va hujjatlardagi sarlavhalar.

### 1.2 Barcha belgilar `components/icons.jsx` dan olinadi

```jsx
import { Icon } from '@/components/icons'
<Icon name="check" size={16} />
```

Yangi ikona kerak bo'lsa — `icons.jsx` ichidagi `P` obyektiga qo'shing.
Tashqi ikona kutubxonasi (`lucide-react`, `react-icons`, ...) **o'rnatilmaydi**:
bizga 60 ta ikona kerak, buning uchun bog'liqlik qo'shish ortiqcha.

Ikona uslubi: `24×24` to'r, `fill="none"`, faqat chiziq, rang har doim
`currentColor`, chiziq qalinligi `1.6`. Yangi ikona shu uslubga mos
bo'lishi shart — to'ldirilgan (solid) yoki ko'p rangli ikona qo'shilmaydi.

### 1.3 Vizual shkala

Bu qiymatlardan chetga chiqmang — bir joyda `borderRadius: 16`,
boshqa joyda `20` bo'lishi interfeysni tarqoq ko'rsatadi.

| Nima | Qiymat |
|---|---|
| Burchak radiusi — kartochka, modal | `10px` |
| Burchak radiusi — tugma, input, tanlagich | `8px` |
| Burchak radiusi — nishon (badge), ikona kvadrati | `6px` |
| Ichki bo'shliq — kartochka | `16px` |
| Elementlar orasi | `8px` yoki `12px` |
| Tugma balandligi | `38px` (asosiy), `34px` (ixcham) |

### 1.4 Soya emas — chegara

Ko'p soya (`box-shadow`) interfeysni "shishgan" ko'rsatadi.
Ajratish uchun **chegara** ishlating:

```js
border: `1px solid ${COLORS.border}`   // ✅
boxShadow: '0 4px 24px rgba(0,0,0,.12)' // ❌ oddiy kartochkada
```

Soya faqat **suzuvchi** elementlarda: modal oyna, toast, ochiladigan ro'yxat.

### 1.5 Gradient ishlatilmaydi

Fon bir tekis rang bo'ladi. `linear-gradient` faqat brend sarlavhasida
ruxsat etilgan emas — u ham olib tashlangan.

### 1.6 Rangdan tejamkor foydalaning

- Yashil (`COLORS.primary`) — **faqat** asosiy amal tugmasi va ijobiy holat
- Qizil — xato, jarima, o'chirish
- Sariq — ogohlantirish, kechikish
- Qolgan hamma narsa — kulrang shkala

Ko'rsatkich kartochkalari ko'p rangli bo'lmaydi: raqam qora, ikona kulrang.
Rang faqat diqqat talab qiladigan qiymatda (jarima, kechikish) qo'llanadi.

---

## 2. Kod qoidalari

### 2.1 Til

Interfeys matni, izohlar va o'zgaruvchi nomlari — **o'zbekcha**
(lotin alifbosida). Texnik atamalar inglizcha qoladi (`useState`,
`collection`, `props`).

Apostrof: `o'`, `g'` uchun **to'g'ri belgi** `'` (U+2018) emas, oddiy
`'` ishlating — JSX ichida `&apos;` yoki `’` ham bo'ladi, lekin bir xil
bo'lsin.

### 2.2 Fayl tuzilishi

```
app/(panel)/<bo'lim>/page.jsx   Nazorat paneli bo'limi. Firestore'ga
                                bevosita murojaat qilmaydi — lib/db.js orqali.
app/kabinet/page.jsx            Xodimning shaxsiy kabineti (worker roli).
app/login, app/sozlash          Kirish va birinchi ishga tushirish.
components/ui.jsx               Umumiy UI. Yangi umumiy komponent shu yerga.
components/icons.jsx            Barcha ikonalar.
lib/payroll.js                  Pul bilan bog'liq BARCHA hisob.
lib/db.js                       Firestore murojaatlari.
lib/username.js                 Login ↔ email o'girish.
lib/worker-auth.js              Xodimga login berish, parol o'zgartirish.
lib/constants.js                Ranglar, rollar, holatlar.
```

**Pul hisobini `lib/payroll.js` dan tashqarida yozmang.** Jarima yoki
oylik formulasi sahifa ichida takrorlansa, qoidani o'zgartirganda
bir joyi yangilanib, boshqasi eskiligicha qoladi.

Oylikdan uch xil ushlab qolish bor va ular aralashtirilmaydi:

| Nima | Qayerdan | Kim yozadi |
|---|---|---|
| `jarima` | kechikkani uchun, davomatdan avtomatik | tizim |
| `avans` | pulni oldindan olgan | admin, kassir |
| `ushlanma` (`charges`) | zimmasiga yozilgan: singan idish, kam kassa | kassir |

`payouts` — kassir haqiqatda bergan pul. U oylik summasini kamaytirmaydi,
faqat "qancha qolgani"ni ko'rsatadi (`payoutState`).

### 2.3 Sana va vaqt

Server UTC da ishlaydi, foydalanuvchi Toshkentda. Shuning uchun
`new Date().toISOString()` yoki `getHours()` **to'g'ridan-to'g'ri
ishlatilmaydi**. Har doim `lib/utils.js`:

```js
import { dateKey, timeNow } from '@/lib/utils'
dateKey()  // '2026-08-18' — Toshkent sanasi
timeNow()  // '09:12'      — Toshkent soati
```

### 2.4 Davomat yozuvi o'zgarmas

`attendance` hujjatiga o'sha kundagi `dailyRate`, `late`, `penalty`,
`earned` **ko'chirib** yoziladi. Hisobot bu qiymatlarni o'qiydi,
xodimning hozirgi stavkasini emas.

Sabab: stavka oshirilsa, o'tgan oylarning hisoboti o'zgarib ketmasligi
kerak. Hisobotni "jonli" hisoblaydigan qilib qayta yozmang.

Hujjat id: `${sana}_${xodimId}` — bir kunga bir xodim uchun ikkita
yozuv paydo bo'lishi mumkin emas.

### 2.5 Login tizimi — email emas, username

Foydalanuvchi **login** kiritadi (`aziz.karimov`), email emas.
O'zbekistonda pochta keng tarqalmagan, xodimlarning ko'pida yo'q.

Firebase Auth username'ni qo'llab-quvvatlamaydi, shuning uchun login
ichki ravishda emailga aylantiriladi — `lib/username.js`:

```js
import { loginToEmail } from '@/lib/username'
signInWithEmailAndPassword(auth, loginToEmail(login), password)
// aziz.karimov → aziz.karimov@chashma.local
```

Bu domenga hech qachon xat yuborilmaydi. Login takrorlanmasligini
Firebase o'zi ta'minlaydi (bir emailga ikkita hisob ochilmaydi).

**O'z parol tizimingizni yozmang.** Parolni Firestore'ga saqlab
brauzerda solishtirish — jiddiy xavf. Parolni shifrlash, urinishlarni
cheklash, seansni himoyalash Firebase zimmasida qolsin.

Yangi foydalanuvchi yaratishda **`getSecondaryAuth()`** ishlating.
Oddiy `createUserWithEmailAndPassword` joriy seansni yangi hisobga
almashtiradi — direktor o'z panelidan chiqib ketadi.

Boshqa foydalanuvchining parolini brauzerdan o'zgartirib bo'lmaydi —
buning uchun server tomonida Admin SDK kerak (Telegram bosqichida
qo'shiladi). Xodim o'z parolini kabinetdan o'zgartira oladi.

### 2.6 Xavfsizlik

Besh rol, `users/{uid}` hujjatida:

| Rol | Nima qiladi |
|---|---|
| `director` | Hamma narsa. Faqat unda: sozlamalar, panel foydalanuvchilari, yozuvlarni **o‘chirish** |
| `admin` | Kadrlar (xodim, stavka, lavozim, login), davomat, avans, eslatma, oylik hisobot |
| `kassir` | Kassa: pul berish, ushlanma yozish, oylik hisobot. Kadrlarga tegmaydi |
| `hostes` | Davomat va shikoyat |
| `worker` | **Faqat o'z** ma'lumotlari — `/kabinet` |

`worker` roli uchun `users/{uid}` da `workerId` maydoni bo'ladi —
u xodimni `workers` kartochkasiga bog'laydi. Xavfsizlik qoidalari
shu id orqali tekshiradi: xodim boshqasining maoshini o'qiy olmaydi.

**Administratorga imtiyoz oshirish yo'li ochilmasin.** U xodimga login
bera oladi, ya'ni `users/{uid}` hujjati yarata oladi. Agar qoida buni
cheklamasa, administrator yangi Firebase hisobi ochib, unga `director`
roli berib, o'sha hisob bilan kirib olardi. Shuning uchun `firestore.rules`
ichida:

```
allow create: if isDirector()
  || (isAdmin()
      && request.resource.data.role == 'worker'
      && request.resource.data.workerId is string);

allow update: if isDirector()
  || (isAdmin()
      && resource.data.role == 'worker'
      && request.resource.data.role == 'worker');
```

Ya'ni administrator faqat `worker` rolidagi hisob yarata oladi va
mavjud xodim hujjatini boshqa rolga ko'chira olmaydi. Rol bilan
bog'liq qoidani o'zgartirsangiz shu shartni buzmang.

Xodim so'rovlari **albatta** `where('workerId','==',<o'zi>)` bilan
cheklangan bo'lishi kerak — aks holda Firestore butun so'rovni rad
etadi. Bunday so'rovlarga sana oralig'ini qo'shmang: qo'shma indeks
(composite index) talab qilinadi. Saralashni brauzerda bajaring.

Brauzerdagi tekshiruv (`can()`, `isDirector`, `isWorker`) **faqat
interfeys uchun**. Haqiqiy himoya — `firestore.rules`.

Yangi kolleksiya qo'shsangiz, `firestore.rules` ga ham qoida yozing.
Qoidasiz kolleksiya `match /{document=**}` ostida yopiq qoladi —
bu xavfsiz, lekin ishlamaydi.

Bot tokeni, xizmat kaliti kabi maxfiy qiymatlar **hech qachon**
`NEXT_PUBLIC_` prefiksi bilan yozilmaydi — ular brauzerga tushadi.

---

## 3. Buyruqlar

```bash
npm run dev     # ishlab chiqish serveri
npm run build   # yig'ish — o'zgartirishdan keyin majburiy tekshiring
```

Testlar hozircha alohida to'plamda emas; `lib/payroll.js` o'zgartirilsa,
hisob to'g'riligini qo'lda tekshiring (namuna qiymatlar `README.md` da).

---

## 4. Nima qilinmaydi

- Emoji qo'shish (1.1-band)
- `lib/payroll.js` dan tashqarida pul hisoblash
- Firestore'ga sahifadan bevosita murojaat (`lib/db.js` orqali)
- Yangi ikona kutubxonasi yoki UI freymvorki o'rnatish
- `.env.local` faylini git'ga qo'shish
- `firestore.rules` ni bo'shatib qo'yish (`allow read, write: if true`)
