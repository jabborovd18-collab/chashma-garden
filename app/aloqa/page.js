import Link from 'next/link'

export default function AloqaPage() {
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
            <h1 style={{fontSize: 24, fontFamily: 'Playfair Display, serif', fontWeight: 700}}>📞 Aloqa</h1>
            <p style={{fontSize: 12, opacity: 0.8}}>Контакты</p>
          </div>
        </div>
      </div>

      <div style={{maxWidth: 480, margin: '0 auto', padding: '24px 16px'}}>
        
        {/* Telefon */}
        <a 
          href="tel:+998880207373"
          className="card-hover"
          style={{
            display: 'block',
            background: 'white',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            marginBottom: 12,
            textDecoration: 'none'
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{
              width: 56,
              height: 56,
              background: '#E8F5E9',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0
            }}>
              📞
            </div>
            <div>
              <p style={{fontSize: 13, color: '#999', marginBottom: 2}}>Telefon raqam</p>
              <p style={{fontSize: 20, fontWeight: 700, color: '#2E7D32'}}>+998 88 020 73 73</p>
              <p style={{fontSize: 12, color: '#4CAF50', marginTop: 4}}>Bosib qo&apos;ng&apos;iroq qiling</p>
            </div>
          </div>
        </a>

        {/* Instagram */}
        <a 
          href="https://instagram.com/chashma_garden" 
          target="_blank"
          className="card-hover"
          style={{
            display: 'block',
            background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
            borderRadius: 20,
            padding: 24,
            marginBottom: 12,
            textDecoration: 'none',
            color: 'white'
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{
              width: 56,
              height: 56,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0
            }}>
              📸
            </div>
            <div>
              <p style={{fontSize: 13, opacity: 0.8, marginBottom: 2}}>Instagram</p>
              <p style={{fontSize: 20, fontWeight: 700}}>@chashma_garden</p>
              <p style={{fontSize: 12, opacity: 0.8, marginTop: 4}}>Sahifamizga o&apos;ting</p>
            </div>
          </div>
        </a>

        {/* Ish vaqti */}
        <div className="card-hover" style={{
          background: 'white',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          marginBottom: 12
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{
              width: 56,
              height: 56,
              background: '#E8F5E9',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0
            }}>
              🕐
            </div>
            <div>
              <p style={{fontSize: 13, color: '#999', marginBottom: 2}}>Ish vaqti</p>
              <p style={{fontSize: 20, fontWeight: 700, color: '#2E7D32'}}>10:00 – 01:00</p>
              <p style={{fontSize: 12, color: '#999', marginTop: 4}}>Har kuni</p>
            </div>
          </div>
        </div>

        {/* Manzil */}
        <div className="card-hover" style={{
          background: 'white',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          marginBottom: 12
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{
              width: 56,
              height: 56,
              background: '#E8F5E9',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0
            }}>
              📍
            </div>
            <div style={{flex: 1}}>
              <p style={{fontSize: 13, color: '#999', marginBottom: 2}}>Manzil</p>
              <p style={{fontSize: 15, fontWeight: 500, color: '#333'}}>Restaurant CHASHMA Garden</p>
              <a 
                href="https://maps.app.goo.gl/59AvrkWhamuPYaaR8" 
                target="_blank"
                style={{color: '#4CAF50', fontSize: 13, marginTop: 4, display: 'inline-block'}}
              >
                Xaritada ochish →
              </a>
            </div>
          </div>
        </div>

        {/* Banket bron qilish */}
        <div style={{
          background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
          borderRadius: 20,
          padding: 28,
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 8px 25px rgba(46,125,50,0.3)'
        }}>
          <span style={{fontSize: 40, display: 'block', marginBottom: 12}}>🎉</span>
          <h3 style={{
            fontSize: 20,
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            marginBottom: 8
          }}>
            Banket bron qilish
          </h3>
          <p style={{fontSize: 14, opacity: 0.85, marginBottom: 16, lineHeight: 1.5}}>
            Tadbirlar va banketlar uchun telefon orqali bron qiling
          </p>
          <a 
            href="tel:+998880207373" 
            style={{
              display: 'inline-block',
              background: 'white',
              color: '#2E7D32',
              padding: '14px 32px',
              borderRadius: 14,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            📞 Qo&apos;ng&apos;iroq qilish
          </a>
        </div>

      </div>

    </div>
  )
}