import Link from 'next/link'

export default function LokatsiyaPage() {
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
            <h1 style={{fontSize: 24, fontFamily: 'Playfair Display, serif', fontWeight: 700}}>📍 Lokatsiya</h1>
            <p style={{fontSize: 12, opacity: 0.8}}>Локация</p>
          </div>
        </div>
      </div>

      <div style={{maxWidth: 480, margin: '0 auto', padding: '24px 16px'}}>
        
        {/* Xarita */}
        <div className="animate-fadeIn" style={{
          background: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          marginBottom: 16
        }}>
          <div style={{
            width: '100%',
            height: 240,
            background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12
          }}>
            <span style={{fontSize: 56}}>🗺️</span>
            <p style={{color: '#666', fontSize: 14}}>Google Maps xaritasi</p>
          </div>
          <div style={{padding: 16}}>
            <a 
              href="https://maps.app.goo.gl/59AvrkWhamuPYaaR8" 
              target="_blank"
              style={{
                display: 'block',
                width: '100%',
                background: '#2E7D32',
                color: 'white',
                textAlign: 'center',
                padding: '14px',
                borderRadius: 12,
                fontWeight: 500,
                fontSize: 15,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(46,125,50,0.3)'
              }}
            >
              🗺️ Google Mapsda ochish
            </a>
          </div>
        </div>

        {/* Manzil kartochkasi */}
        <div className="card-hover" style={{
          background: 'white',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          marginBottom: 12
        }}>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
            <div style={{
              width: 48,
              height: 48,
              background: '#E8F5E9',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0
            }}>
              📍
            </div>
            <div>
              <h3 style={{fontWeight: 600, color: '#333', fontSize: 16, marginBottom: 4}}>Manzil</h3>
              <p style={{color: '#666', fontSize: 14, lineHeight: 1.5}}>Restaurant CHASHMA Garden</p>
              <a 
                href="https://maps.app.goo.gl/59AvrkWhamuPYaaR8" 
                target="_blank"
                style={{color: '#4CAF50', fontSize: 13, marginTop: 6, display: 'inline-block'}}
              >
                Xaritada ko&apos;rish →
              </a>
            </div>
          </div>
        </div>

        {/* Ish vaqti kartochkasi */}
        <div className="card-hover" style={{
          background: 'white',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          marginBottom: 12
        }}>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
            <div style={{
              width: 48,
              height: 48,
              background: '#E8F5E9',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0
            }}>
              🕐
            </div>
            <div>
              <h3 style={{fontWeight: 600, color: '#333', fontSize: 16, marginBottom: 4}}>Ish vaqti</h3>
              <p style={{fontSize: 22, fontWeight: 700, color: '#2E7D32'}}>10:00 – 01:00</p>
              <p style={{color: '#999', fontSize: 13, marginTop: 2}}>Har kuni, dam olish kunlarisiz</p>
            </div>
          </div>
        </div>

        {/* Telefon kartochkasi */}
        <div className="card-hover" style={{
          background: 'white',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          marginBottom: 12
        }}>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
            <div style={{
              width: 48,
              height: 48,
              background: '#E8F5E9',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0
            }}>
              📞
            </div>
            <div>
              <h3 style={{fontWeight: 600, color: '#333', fontSize: 16, marginBottom: 4}}>Telefon</h3>
              <a 
                href="tel:+998880207373" 
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#2E7D32',
                  textDecoration: 'none'
                }}
              >
                +998 88 020 73 73
              </a>
              <p style={{color: '#999', fontSize: 12, marginTop: 4}}>Bosib qo&apos;ng&apos;iroq qiling</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}