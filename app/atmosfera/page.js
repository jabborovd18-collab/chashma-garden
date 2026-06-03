import Link from 'next/link'

export default function AtmosferaPage() {
  const photos = [
    {
      icon: '🌳',
      title: "Bog' qismi",
      sub: 'Tabiat qo\'ynidagi ochiq maydon',
      desc: 'Yashil maysazor, daraxtlar soyasi va toza havo. Ochiq havoda ovqatlanish uchun eng yaxshi joy.'
    },
    {
      icon: '🏠',
      title: 'Ichki zal',
      sub: 'Oilaviy va do\'stona uchrashuvlar uchun',
      desc: 'Issiq va qulay muhit, zamonaviy interyer. Har bir mehmon uchun alohida e\'tibor.'
    },
    {
      icon: '🎉',
      title: 'Banket zali',
      sub: 'Katta tadbirlar va to\'ylar uchun',
      desc: '200 kishigacha sig\'adigan keng zal. To\'y, tug\'ilgan kun va korporativ tadbirlar uchun ideal.'
    }
  ]

  return (
    <div style={{minHeight: '100vh', background: '#FAFAFA'}}>
      
      {/* Header */}
      <div className="sticky-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        color: 'white',
        padding: '16px 20px'
      }}>
        <div style={{maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16}}>
          <Link href="/" style={{color: 'white', fontSize: 24, textDecoration: 'none'}}>←</Link>
          <div>
            <h1 style={{fontSize: 24, fontFamily: 'Playfair Display, serif', fontWeight: 700}}>🌿 Atmosfera</h1>
            <p style={{fontSize: 12, opacity: 0.8}}>Атмосфера</p>
          </div>
        </div>
      </div>

      {/* Kontent */}
      <div style={{maxWidth: 480, margin: '0 auto', padding: '24px 16px'}}>
        
        {/* Sarlavha */}
        <div className="animate-fadeIn" style={{marginBottom: 24}}>
          <p style={{fontSize: 15, color: '#666', lineHeight: 1.6}}>
            Restaranimizning ichki va tashqi ko&apos;rinishi bilan tanishing. 
            Har bir burchakda tabiat va qulaylik uyg&apos;unligi.
          </p>
          <div style={{width: 40, height: 2, background: '#4CAF50', marginTop: 12}} />
        </div>

        {/* Galereya */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {photos.map((photo, index) => (
            <div
              key={index}
              className="card-hover"
              style={{
                background: 'white',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                animation: 'fadeIn 0.6s ease',
                animationDelay: `${index * 0.15}s`,
                animationFillMode: 'both'
              }}
            >
              {/* Surat o'rni */}
              <div style={{
                width: '100%',
                height: 200,
                background: `linear-gradient(135deg, ${index === 0 ? '#E8F5E9' : index === 1 ? '#FFF3E0' : '#F3E5F5'}, ${index === 0 ? '#C8E6C9' : index === 1 ? '#FFE0B2' : '#E1BEE7'})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{fontSize: 64, opacity: 0.6}}>{photo.icon}</span>
              </div>

              {/* Ma'lumot */}
              <div style={{padding: '20px 24px'}}>
                <h3 style={{
                  fontSize: 20,
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 700,
                  color: '#333',
                  marginBottom: 4
                }}>
                  {photo.title}
                </h3>
                <p style={{fontSize: 14, color: '#2E7D32', fontWeight: 500, marginBottom: 8}}>
                  {photo.sub}
                </p>
                <p style={{fontSize: 14, color: '#777', lineHeight: 1.5}}>
                  {photo.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Qo'shimcha ma'lumot */}
        <div style={{
          marginTop: 24,
          background: 'white',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          textAlign: 'center'
        }}>
          <span style={{fontSize: 40, display: 'block', marginBottom: 12}}>📸</span>
          <p style={{fontSize: 15, color: '#666', lineHeight: 1.6}}>
            To&apos;liq fotogalereya tez orada yuklanadi. 
            Restaranimizning har bir go&apos;shasini kashf eting!
          </p>
          <p style={{fontSize: 13, color: '#999', marginTop: 8}}>
            To&apos;liq фотогалерея скоро будет загружена
          </p>
        </div>

      </div>

    </div>
  )
}