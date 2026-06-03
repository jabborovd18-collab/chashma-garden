import Link from 'next/link'
import { getCategoryById, menuData } from '@/data/menu'
import { use } from 'react'

export async function generateStaticParams() {
  return menuData.categories.map((cat) => ({
    kategoriya: cat.id,
  }))
}

export default function KategoriyaPage({ params }) {
  const { kategoriya } = use(params)
  const category = getCategoryById(kategoriya)

  if (!category) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA'}}>
        <div style={{textAlign: 'center'}}>
          <span style={{fontSize: 48}}>😕</span>
          <p style={{fontSize: 18, color: '#999', marginTop: 12}}>Kategoriya topilmadi</p>
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
          <Link href="/menyu" style={{color: 'white', fontSize: 24, textDecoration: 'none', marginBottom: 8, display: 'inline-block'}}>←</Link>
          <h1 style={{fontSize: 24, fontFamily: 'Playfair Display, serif', fontWeight: 700}}>
            {category.icon} {category.name_ru}
          </h1>
          <p style={{fontSize: 13, opacity: 0.8}}>{category.name_uz}</p>
        </div>
      </div>

      <div style={{maxWidth: 480, margin: '0 auto', padding: '24px 16px'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          {category.items.map((item, index) => (
            <Link
              key={item.id}
              href={`/menyu/${category.id}/${item.id}`}
              className="card-hover"
              style={{
                background: 'white',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
                textDecoration: 'none',
                animation: 'slideIn 0.4s ease',
                animationDelay: `${index * 0.03}s`,
                animationFillMode: 'both'
              }}
            >
              <div style={{flex: 1, minWidth: 0, paddingRight: 12}}>
                <h3 style={{fontWeight: 500, color: '#333', fontSize: 15, lineHeight: 1.4}}>
                  {item.name_ru}
                </h3>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0}}>
                <span style={{
                  fontWeight: 700,
                  color: '#2E7D32',
                  fontSize: 16,
                  whiteSpace: 'nowrap'
                }}>
                  {item.price.toLocaleString()} so&apos;m
                </span>
                <span style={{color: '#4CAF50', fontSize: 18}}>→</span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{
          marginTop: 24,
          background: '#E8F5E9',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center',
          border: '1px solid #C8E6C9'
        }}>
          <p style={{fontSize: 14, color: '#2E7D32', fontWeight: 500}}>
            💡 Narxlarga 12% xizmat haqi qo&apos;shiladi
          </p>
        </div>
      </div>

    </div>
  )
}