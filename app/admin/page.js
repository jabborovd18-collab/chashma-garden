'use client'

import { useState } from 'react'
import { menuData } from '@/data/menu'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [message, setMessage] = useState('')

  const adminUsername = 'admin'
  const adminPassword = 'chashma2024'

  const handleLogin = () => {
    if (username === adminUsername && password === adminPassword) {
      setIsLoggedIn(true)
      setMessage('')
    } else {
      setMessage('Login yoki parol xato!')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <span className="text-5xl">🔐</span>
            <h1 className="text-2xl font-bold text-green-800 mt-3">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Chashma Garden</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="Loginni kiriting"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="Parolni kiriting"
              />
            </div>

            {message && (
              <p className="text-red-500 text-sm text-center">{message}</p>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Kirish
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-green-700 text-white px-4 py-5 sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">⚙️ Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            Chiqish
          </button>
        </div>
      </div>

      {/* Admin kontenti */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* Xush kelibsiz */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-green-800">Xush kelibsiz, Admin!</h2>
          <p className="text-gray-500 text-sm mt-1">
            Bu yerda menyuni tahrirlashingiz, taomlar qo&apos;shishingiz va o&apos;chirishingiz mumkin.
          </p>
        </div>

        {/* Tezkor statistikalar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <span className="text-3xl">📋</span>
            <p className="text-2xl font-bold text-green-700">{menuData.categories.length}</p>
            <p className="text-xs text-gray-500">Kategoriyalar</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <span className="text-3xl">🍽️</span>
            <p className="text-2xl font-bold text-green-700">
              {menuData.categories.reduce((total, cat) => total + cat.items.length, 0)}
            </p>
            <p className="text-xs text-gray-500">Taomlar</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <span className="text-3xl">🌿</span>
            <p className="text-2xl font-bold text-green-700">1</p>
            <p className="text-xs text-gray-500">Restaran</p>
          </div>
        </div>

        {/* Menyu tahrirlash */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 text-lg mb-4">📝 Menyu tahrirlash</h3>
          
          <div className="space-y-4">
            {/* Kategoriya tanlash */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSelectedItem('')
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 bg-white"
              >
                <option value="">Kategoriyani tanlang</option>
                {menuData.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name_ru} ({cat.name_uz})
                  </option>
                ))}
              </select>
            </div>

            {/* Taom tanlash */}
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taom</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 bg-white"
                >
                  <option value="">Taomni tanlang</option>
                  {menuData.categories
                    .find((cat) => cat.id === selectedCategory)
                    ?.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name_ru} - {item.price.toLocaleString()} so&apos;m
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Tahrirlash tugmalari */}
            <div className="flex gap-3 pt-2">
              <button className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors">
                ✏️ Tahrirlash
              </button>
              <button className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors">
                ❌ Stop qo&apos;yish
              </button>
            </div>
          </div>
        </div>

        {/* Yangi taom qo'shish */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 text-lg mb-4">➕ Yangi taom qo&apos;shish</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (Ruscha)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="Название блюда"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (O&apos;zbekcha)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="Taom nomi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Narxi (so&apos;m)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="45000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
              <select className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 bg-white">
                <option value="">Kategoriyani tanlang</option>
                {menuData.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name_ru}
                  </option>
                ))}
              </select>
            </div>

            <button className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors">
              ➕ Qo&apos;shish
            </button>
          </div>
        </div>

        {/* Keyingi versiyada */}
        <div className="bg-yellow-50 rounded-2xl shadow-sm p-5 text-center">
          <p className="text-yellow-800 text-sm">
            ⚠️ Bu demo admin panel. To&apos;liq versiyada barcha funksiyalar ishlaydi: 
            menyuni tahrirlash, badge qo&apos;shish, surat yuklash, stop-list.
          </p>
        </div>

      </div>

    </div>
  )
}