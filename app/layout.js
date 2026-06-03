import './globals.css'

export const metadata = {
  title: "Chashma Garden | Tabiat qo'ynidagi lazzat",
  description: 'Chashma Garden restorani - mazali taomlar, oilaviy muhit va banketlar uchun eng yaxshi tanlov',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <main className="pb-20">
          {children}
        </main>
        
        <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-lg mx-auto flex justify-around items-center h-16">
            <a href="/" className="flex flex-col items-center justify-center w-full h-full text-green-600">
              <span className="text-xl">🌿</span>
              <span className="text-[10px] mt-1 font-medium">Bosh</span>
            </a>
            <a href="/menyu" className="flex flex-col items-center justify-center w-full h-full text-gray-500">
              <span className="text-xl">🍽️</span>
              <span className="text-[10px] mt-1 font-medium">Menyu</span>
            </a>
            <a href="/lokatsiya" className="flex flex-col items-center justify-center w-full h-full text-gray-500">
              <span className="text-xl">📍</span>
              <span className="text-[10px] mt-1 font-medium">Xarita</span>
            </a>
            <a href="/aloqa" className="flex flex-col items-center justify-center w-full h-full text-gray-500">
              <span className="text-xl">📞</span>
              <span className="text-[10px] mt-1 font-medium">Aloqa</span>
            </a>
          </div>
        </nav>
      </body>
    </html>
  )
}