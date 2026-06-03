import Link from 'next/link'
import { menuData } from '@/data/menu'

export default function MenyuPage() {
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
            <h1 style={{fontSize: 24, fontFamily: 'Playfair Display, serif', fontWeight: 700}}>🍽️ Menyu</h1>
            <p style={{fontSize: 12, opacity: 0.8}}>Меню</p>
          </div>
        </div>
      </div>

      <div style={{maxWidth: 480, margin: '0 auto', padding: '24px 16px'}}>
        
        {/* Sarlavha */}
        <div className="animate-fadeIn" style={{marginBottom: 24}}>
          <p style={{fontSize: 13, color: '#999', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500}}>
            📋 MENYU TURKUMLARI
          </p>
          <div style={{width: 40, height: 2, background: '#4CAF50', marginTop: 8}} />
        </div>
        
        {/* Kategoriyalar */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          {menuData.categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/menyu/${category.id}`}
              className="card-hover"
              style={{
                background: 'white',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                textDecoration: 'none',
                animation: 'slideIn 0.5s ease',
                animationDelay: `${index * 0.04}s`,
                animationFillMode: 'both'
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                background: '#E8F5E9',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                flexShrink: 0
              }}>
                {category.icon}
              </div>
              
              <div style={{flex: 1, minWidth: 0}}>
                <p style={{fontWeight: 600, color: '#333', fontSize: 16}}>{category.name_ru}</p>
                <p style={{fontSize: 12, color: '#999', marginTop: 2}}>{category.name_uz}</p>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <span style={{
                  fontSize: 11,
                  color: '#999',
                  background: '#F5F5F5',
                  padding: '4px 10px',
                  borderRadius: 20
                }}>
                  {category.items.length}
                </span>
                <span style={{color: '#4CAF50', fontSize: 20}}>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Xizmat haqi */}
        <div style={{
          marginTop: 24,
          background: '#E8F5E9',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center',
          border: '1px solid #C8E6C9'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
            <span style={{fontSize: 18}}>💡</span>
            <p style={{fontSize: 14, color: '#2E7D32', fontWeight: 500}}>
              Narxlarga 12% xizmat haqi qo&apos;shiladi
            </p>
          </div>
          <p style={{fontSize: 12, color: '#4CAF50', marginTop: 4}}>
            К ценам добавляется 12% за обслуживание
          </p>
        </div>

      </div>

    </div>
  )
}