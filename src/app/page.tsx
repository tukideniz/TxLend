'use client'

import { useState, useEffect } from 'react'
import { isConnected, requestAccess } from '@stellar/freighter-api'
import { defineBorrower, undefineBorrower, getCurrentDefinition } from './contract'

export default function Home() {
  // State management
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  
  // Define/Undefine states
  const [itemName, setItemName] = useState('')
  const [borrowerAddress, setBorrowerAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Query states (separate from define/undefine)
  const [queryItemName, setQueryItemName] = useState('')
  const [queryResult, setQueryResult] = useState<string | null>(null)
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryMessage, setQueryMessage] = useState('')

  // Freighter kontrolü
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const connected = await isConnected()
      if (connected) {
        // Eğer daha önce bağlanmışsa otomatik bağlan
        const address = await requestAccess()
        if (address && typeof address === 'string') {
          setWalletAddress(address)
          setIsWalletConnected(true)
        }
      }
    } catch (error) {
      console.error('Connection check error:', error)
    }
  }

  // Cüzdan bağlantısı
  const connectWallet = async () => {
    setMessage('🔄 Cüzdan bağlanıyor...')
    console.log('Requesting wallet access...')
    
    try {
      const address = await requestAccess()
      console.log('Wallet access result:', address)
      
      // requestAccess() direkt string (adres) döndürür
      if (!address || typeof address !== 'string') {
        setMessage('❌ Cüzdan adresi alınamadı. Freighter\'ı açıp tekrar deneyin.')
        return
      }
      
      setWalletAddress(address)
      setIsWalletConnected(true)
      setMessage('✅ Cüzdan bağlandı!')
      console.log('Connected address:', address)
    } catch (error: any) {
      console.error('Connect wallet error:', error)
      
      // Freighter yüklü değilse kullanıcıyı bilgilendir
      if (error.message && error.message.includes('User declined access')) {
        setMessage('❌ Cüzdan bağlantısı reddedildi')
      } else {
        setMessage('❌ Freighter extension\'ını yükleyip sayfayı yenileyin!')
      }
    }
  }

  // Cüzdan oluştur - Freighter indirme sayfasına yönlendir
  const createWallet = () => {
    window.open('https://www.freighter.app/', '_blank')
    setMessage('💡 Freighter\'ı yükledikten sonra sayfayı yenileyin ve "Cüzdanı Bağla" butonuna tıklayın')
  }

  // Cüzdan bağlantısını kes
  const disconnectWallet = () => {
    setWalletAddress('')
    setIsWalletConnected(false)
    setMessage('Cüzdan bağlantısı kesildi')
  }

  // Contract fonksiyonu: Define Borrower
  const handleDefineBorrower = async () => {
    if (!itemName || !borrowerAddress) {
      setMessage('❌ Lütfen tüm alanları doldurun')
      return
    }

    setLoading(true)
    setMessage('🔄 İşlem hazırlanıyor... (Freighter ile imzalayın)')

    try {
      const txHash = await defineBorrower(walletAddress, itemName, borrowerAddress)
      setMessage(`✅ Başarılı! "${itemName}" eşyası tanımlandı. TX: ${txHash?.slice(0, 8) || txHash}...`)
      // Clear inputs after success
      setItemName('')
      setBorrowerAddress('')
    } catch (error: any) {
      setMessage(`❌ İşlem başarısız: ${error.message || 'Bilinmeyen hata'}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Contract fonksiyonu: Undefine Borrower
  const handleUndefineBorrower = async () => {
    if (!itemName) {
      setMessage('❌ Lütfen eşya adını girin')
      return
    }

    setLoading(true)
    setMessage('🔄 İşlem hazırlanıyor... (Freighter ile imzalayın)')

    try {
      const txHash = await undefineBorrower(walletAddress, itemName)
      setMessage(`✅ Başarılı! "${itemName}" tanımı kaldırıldı. TX: ${txHash?.slice(0, 8) || txHash}...`)
      // Clear inputs after success
      setItemName('')
      setBorrowerAddress('')
    } catch (error: any) {
      setMessage(`❌ İşlem başarısız: ${error.message || 'Bilinmeyen hata'}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Contract fonksiyonu: Query (ayrı section için)
  const handleQuery = async () => {
    if (!queryItemName) {
      setQueryMessage('❌ Please enter an item name')
      return
    }

    setQueryLoading(true)
    setQueryMessage('🔍 Querying...')
    setQueryResult(null)

    try {
      const result = await getCurrentDefinition(queryItemName)
      if (result) {
        setQueryResult(result)
        setQueryMessage('')
      } else {
        setQueryResult(null)
        setQueryMessage(`ℹ️ No record found for "${queryItemName}"`)
      }
    } catch (error: any) {
      setQueryMessage(`❌ Query failed: ${error.message || 'Unknown error'}`)
      setQueryResult(null)
      console.error(error)
    } finally {
      setQueryLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-white">DeFinition</h1>
          <p className="text-purple-300 text-sm">Ödünç Takipçisi • Stellar Soroban</p>
        </div>
        <div>
          {isWalletConnected && walletAddress ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-purple-300">Bağlı Cüzdan</p>
                <p className="text-sm font-mono text-white">
                  {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                </p>
              </div>
              <button
                onClick={disconnectWallet}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg border border-red-500/30 transition"
              >
                Bağlantıyı Kes
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={createWallet}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition shadow-lg"
              >
                🆕 Cüzdan Oluştur
              </button>
              <button
                onClick={connectWallet}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-purple-500/50"
              >
                🔗 Cüzdanı Bağla
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {!isWalletConnected || !walletAddress ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Cüzdan Bağlantısı Gerekli</h2>
            <div className="space-y-3 text-purple-300 max-w-md mx-auto">
              <p>✨ Yeni kullanıcı mısınız? <strong>"Cüzdan Oluştur"</strong> butonuna tıklayarak Freighter extension&apos;ını yükleyin.</p>
              <p>🔗 Freighter zaten yüklüyse? <strong>"Cüzdanı Bağla"</strong> butonuna tıklayın.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Input Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Eşya Bilgileri</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Eşya Adı
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: kitap, alet, şarj aleti"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Ödünç Alanın Adresi (Public Key)
                  </label>
                  <input
                    type="text"
                    placeholder="GXXXXXX... (Stellar adresi)"
                    value={borrowerAddress}
                    onChange={(e) => setBorrowerAddress(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDefineBorrower}
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition shadow-lg"
              >
                Define Borrower
              </button>
              
              <button
                onClick={handleUndefineBorrower}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition shadow-lg"
              >
                Undefine
              </button>
            </div>

            {/* Status Display */}
            {message && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-white text-center">{message}</p>
              </div>
            )}

            {/* Separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-purple-300">Query Section</span>
              </div>
            </div>

            {/* Query Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">🔍 Check Item Status</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. laptop, book, charger"
                    value={queryItemName}
                    onChange={(e) => setQueryItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleQuery}
                  disabled={queryLoading}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition shadow-lg"
                >
                  {queryLoading ? '🔍 Querying...' : '🔍 Query'}
                </button>

                {/* Query Result */}
                {queryResult && (
                  <div className="bg-green-600/20 backdrop-blur-md rounded-lg p-4 border border-green-500/30">
                    <p className="text-sm text-green-300 mb-2">✅ Item is assigned to:</p>
                    <p className="font-mono text-white bg-black/30 p-3 rounded text-center break-all">
                      {queryResult.slice(0, 6)}...{queryResult.slice(-6)}
                    </p>
                  </div>
                )}

                {/* Query Message */}
                {queryMessage && (
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <p className="text-white text-center">{queryMessage}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/30">
              <p className="text-sm text-blue-200">
                ℹ️ <strong>Note:</strong> All transactions are signed with your Freighter wallet. 
                You can only define items you own (require_auth).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full p-4 text-center text-purple-300 text-sm backdrop-blur-sm bg-black/20">
        Built on Stellar Testnet • Soroban Smart Contract
      </footer>
    </main>
  )
}

