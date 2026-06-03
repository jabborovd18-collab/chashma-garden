import Link from 'next/link'
import { getItemById, menuData } from '@/data/menu'
import { use } from 'react'

export async function generateStaticParams() {
  const paths = []
  menuData.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      paths.push({
        kategoriya: cat.id,
        taom: item.id,
      })
    })
  })
  return paths
}

export default function TaomPage({ params }) {
  const { kategoriya, taom } = use(params)
  const item = getItemById(kategoriya, taom)
  const category = menuData.categories.find(cat => cat.id === kategoriya)

  if (!item || !category) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA'}}>
        <div style={{textAlign: 'center'}}>
          <span style={{fontSize: 48}}>😕</span>
          <p style={{fontSize: 18, color: '#999', marginTop: 12}}>Taom topilmadi</p>
          <Link href="/menyu" style={{color: '#4CAF50', marginTop: 16, display: 'inline-block'}}>← Menyuga qaytish</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight: '100vh', background: '#FAFAFA'}}>
      
      <div className="sticky-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        color: 'white',
        padding: '16px 20px'
      }}>
        <div style={{maxWidth: 480, margin: '0 auto'}}>
          <Link href={`/menyu/${category.id}`} style={{color: 'white', fontSize: 24, textDecoration: 'none', marginBottom: 8, display: 'inline-block'}}>←</Link>
          <h1 style={{fontSize: 20, fontFamily: 'Playfair Display, serif', fontWeight: 700, lineHeight: 1.3}}>
            {item.name_ru}
          </h1>
        </div>
      </div>

      <div style={{maxWidth: 480, margin: '0 auto', padding: '24px 16px'}}>
        
        <div style={{
          width: '100%',
          height: 240,
          background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
        }}>
          <div style={{textAlign: 'center'}}>
            <span style={{fontSize: 64, display: 'block', marginBottom: 8}}>{category.icon}</span>
            <p style={{color: '#999', fontSize: 14}}>Rasm keyin qo&apos;shiladi</p>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          marginBottom: 12
        }}>
          
          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16}}>
            <span style={{
              fontSize: 11,
              color: '#999',
              border: '1px dashed #DDD',
              borderRadius: 20,
              padding: '4px 12px'
            }}>
              Badgelar keyin qo&apos;shiladi
            </span>
          </div>

          <h2 style={{
            fontSize: 24,
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            color: '#333',
            marginBottom: 8
          }}>
            {item.name_ru}
          </h2>

          <div style={{
            display: 'inline-block',
            background: '#E8F5E9',
            borderRadius: 12,
            padding: '10px 20px',
            marginBottom: 20
          }}>
            <span style={{fontSize: 28, fontWeight: 700, color: '#2E7D32'}}>
              {item.price.toLocaleString()}
            </span>
            <span style={{fontSize: 16, color: '#4CAF50', marginLeft: 4}}>so&apos;m</span>
          </div>

          <div style={{height: 1, background: '#F0F0F0', margin: '20px 0'}} />

          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16}}>
            <span style={{fontSize: 20}}>⚖️</span>
            <div>
              <p style={{fontWeight: 500, color: '#333', fontSize: 14}}>Og&apos;irligi</p>
              <p style={{color: '#999', fontSize: 13, fontStyle: 'italic'}}>Keyin qo&apos;shiladi</p>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16}}>
            <span style={{fontSize: 20}}>📝</span>
            <div>
              <p style={{fontWeight: 500, color: '#333', fontSize: 14, marginBottom: 4}}>Tarkibi</p>
              <p style={{color: '#999', fontSize: 13, fontStyle: 'italic'}}>Keyin qo&apos;shiladi</p>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16}}>
            <span style={{fontSize: 20}}>👨‍🍳</span>
            <div>
              <p style={{fontWeight: 500, color: '#333', fontSize: 14}}>Shef</p>
              <p style={{color: '#999', fontSize: 13, fontStyle: 'italic'}}>Keyin qo&apos;shiladi</p>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16}}>
            <span style={{fontSize: 20}}>⏱️</span>
            <div>
              <p style={{fontWeight: 500, color: '#333', fontSize: 14}}>Tayyorlanish vaqti</p>
              <p style={{color: '#999', fontSize: 13, fontStyle: 'italic'}}>Keyin qo&apos;shiladi</p>
            </div>
          </div>

        </div>

        <div style={{
          background: '#E8F5E9',
          borderRadius: 16,
          padding: 16,
          textAlign: 'center',
          border: '1px solid #C8E6C9',
          marginBottom: 20
        }}>
          <p style={{fontSize: 13, color: '#2E7D32', fontWeight: 500}}>
            💡 Narxlarga 12% xizmat haqi qo&apos;shiladi
          </p>
        </div>

        <Link
          href={`/menyu/${category.id}`}
          style={{
            display: 'block',
            width: '100%',
            background: '#2E7D32',
            color: 'white',
            textAlign: 'center',
            padding: '14px',
            borderRadius: 14,
            fontWeight: 500,
            fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(46,125,50,0.3)'
          }}
        >
          ← {category.name_ru}ga qaytish
        </Link>

      </div>

    </div>
  )
}