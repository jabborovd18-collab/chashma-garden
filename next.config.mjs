/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * `firebase-admin` bundle qilinmaydi — u Node modullarini dinamik
   * yuklaydi va grpc kabi ichki bog'liqliklarga tayanadi. Yig'uvchi
   * uni o'z ichiga olsa, import paytida yiqiladi va bu xato marshrut
   * ichidagi try/catch ga tushmay, HTML 500 bo'lib chiqadi.
   *
   * Lokal `next start` da bu sezilmagan edi, chunki modul o'z joyidan
   * o'qilgan. Vercel'da esa fayllar boshqacha yig'iladi.
   */
  serverExternalPackages: ['firebase-admin'],
}

export default nextConfig
