import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{minHeight: '100vh'}}>
      
      {/* Hero Banner */}
      <section style={{
        position: 'relative',
        height: '70vh',
        background: 'linear-gradient(135deg, #1B5E20, #2E7D32, #4CAF50)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '0 24px',
        overflow: 'hidden'
      }}>
        <div style={{position: 'absolute', inset: 0, opacity: 0.1}}>
          <div style={{position: 'absolute', top: 40, left: 40, width: 160, height: 160, border: '1px solid white', borderRadius: '50%'}} />
          <div style={{position: 'absolute', bottom: 80, right: 40, width: 240, height: 240, border: '1px solid white', borderRadius: '50%'}} />
        </div>

        <div className="animate-fadeIn" style={{position: 'relative', zIndex: 10}}>
          <div style={{marginBottom: 16}}>
            <span style={{fontSize: 60}}>🌿</span>
          </div>
          <h1 style={{fontSize: 48, fontFamily: 'Playfair Display, serif', fontWeight: 700, marginBottom: 4, letterSpacing: 2}}>
            Chashma Garden
          </h1>
          <div style={{width: 80, height: 2, background: 'rgba(255,255,255,0.5)', margin: '16px auto'}} />
          <p style={{fontSize: 20, fontWeight: 300, opacity: 0.9, letterSpacing: 1}}>
            Tabiat qo&apos;ynidagi lazzat
          </p>
          <p style={{fontSize: 14, opacity: 0.7, marginTop: 12, fontWeight: 300}}>
            Природа и вкус в гармонии
          </p>
        </div>

        <div className="wave">
          <svg viewBox="0 0 1440 120" fill="#FAFAFA">
            <path d="M0,80 C240,120 480,40 720,60 C960,80 1200,30 1440,70 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* 4 ta ikonka */}
      <section style={{padding: '40px 16px', marginTop: -32, position: 'relative', zIndex: 20}}>
        <div style={{maxWidth: 480, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
          
          <Link href="/atmosfera" className="card-hover" style={{
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none'
          }}>
            <div style={{width: 64, height: 64, background: '#E8F5E9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>
              🌿
            </div>
            <span style={{fontWeight: 600, color: '#333'}}>Atmosfera</span>
            <span style={{fontSize: 12, color: '#999'}}>Атмосфера</span>
          </Link>

          <Link href="/menyu" className="card-hover" style={{
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none'
          }}>
            <div style={{width: 64, height: 64, background: '#E8F5E9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>
              🍽️
            </div>
            <span style={{fontWeight: 600, color: '#333'}}>Menyu</span>
            <span style={{fontSize: 12, color: '#999'}}>Меню</span>
          </Link>

          <Link href="/lokatsiya" className="card-hover" style={{
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none'
          }}>
            <div style={{width: 64, height: 64, background: '#E8F5E9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>
              📍
            </div>
            <span style={{fontWeight: 600, color: '#333'}}>Lokatsiya</span>
            <span style={{fontSize: 12, color: '#999'}}>Локация</span>
          </Link>

          <Link href="/aloqa" className="card-hover" style={{
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none'
          }}>
            <div style={{width: 64, height: 64, background: '#E8F5E9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>
              📞
            </div>
            <span style={{fontWeight: 600, color: '#333'}}>Aloqa</span>
            <span style={{fontSize: 12, color: '#999'}}>Контакты</span>
          </Link>

        </div>
      </section>

      {/* Nega biz */}
      <section style={{padding: '40px 16px'}}>
        <div style={{maxWidth: 480, margin: '0 auto'}}>
          <h2 style={{textAlign: 'center', fontSize: 28, color: '#1B5E20', marginBottom: 8}}>
            Nega aynan biz?
          </h2>
          <p style={{textAlign: 'center', color: '#999', marginBottom: 32, fontSize: 14}}>
            Почему выбирают нас?
          </p>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16}}>
            {[
              { icon: '🌳', title: 'Tabiat qo\'ynida', sub: 'На природе' },
              { icon: '👨‍👩‍👧‍👦', title: 'Oilaviy muhit', sub: 'Семейная атмосфера' },
              { icon: '🎉', title: 'Banket zali', sub: 'Банкетный зал' },
            ].map((item, i) => (
              <div key={i} className="card-hover" style={{
                background: 'white',
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <div style={{width: 56, height: 56, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12'}}>
                  {item.icon}
                </div>
                <p style={{fontWeight: 600, color: '#1B5E20', fontSize: 14}}>{item.title}</p>
                <p style={{fontSize: 12, color: '#999', marginTop: 4}}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ish vaqti */}
      <section style={{padding: '32px 16px'}}>
        <div style={{maxWidth: 480, margin: '0 auto'}}>
          <div style={{
            background: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
            borderRadius: 24,
            padding: 32,
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(46,125,50,0.3)'
          }}>
            <span style={{fontSize: 40, display: 'block', marginBottom: 16}}>🕐</span>
            <p style={{fontSize: 16, fontWeight: 300, opacity: 0.9}}>Ish vaqti / Режим работы</p>
            <p style={{fontSize: 32, fontFamily: 'Playfair Display, serif', fontWeight: 700, marginTop: 8}}>10:00 – 01:00</p>
            <p style={{fontSize: 14, opacity: 0.8, marginTop: 4}}>Har kuni / Ежедневно</p>
            <div style={{width: 48, height: 2, background: 'rgba(255,255,255,0.3)', margin: '16px auto'}} />
            <p style={{fontSize: 14, opacity: 0.8}}>📞 +998 88 020 73 73</p>
          </div>
        </div>
      </section>

      <footer style={{textAlign: 'center', padding: 24, color: '#999', fontSize: 12}}>
        <p>© 2025 Chashma Garden. Barcha huquqlar himoyalangan.</p>
      </footer>

    </div>
  )
}