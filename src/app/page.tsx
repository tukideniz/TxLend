'use client'

import { useState, useEffect } from 'react'
import { isConnected, requestAccess } from '@stellar/freighter-api'
import { defineBorrower, undefineBorrower } from './contract'

export default function Home() {
  // State management
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  
  // Define/Undefine states
  const [itemName, setItemName] = useState('')
  const [borrowerAddress, setBorrowerAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // TX Hash Proof states
  const [lastTxHash, setLastTxHash] = useState<string>('')
  const [lastTxMessage, setLastTxMessage] = useState<string>('')

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
    setMessage('🔄 Connecting wallet...')
    console.log('Requesting wallet access...')
    
    try {
      const address = await requestAccess()
      console.log('Wallet access result:', address)
      
      // requestAccess() returns string (address) directly
      if (!address || typeof address !== 'string') {
        setMessage('❌ Could not get wallet address. Please open Freighter and try again.')
        return
      }
      
      setWalletAddress(address)
      setIsWalletConnected(true)
      setMessage('✅ Wallet connected!')
      console.log('Connected address:', address)
    } catch (error: any) {
      console.error('Connect wallet error:', error)
      
      // Inform user if Freighter is not installed
      if (error.message && error.message.includes('User declined access')) {
        setMessage('❌ Wallet connection declined')
      } else {
        setMessage('❌ Please install Freighter extension and refresh the page!')
      }
    }
  }

  // Create wallet - redirect to Freighter download page
  const createWallet = () => {
    window.open('https://www.freighter.app/', '_blank')
    setMessage('💡 After installing Freighter, refresh the page and click "Connect Wallet"')
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress('')
    setIsWalletConnected(false)
    setMessage('Wallet disconnected')
  }

  // Contract function: Define Borrower
  const handleDefineBorrower = async () => {
    if (!itemName || !borrowerAddress) {
      setMessage('❌ Please fill all fields')
      return
    }

    setLoading(true)
    setMessage('🔄 Preparing transaction... (Sign with Freighter)')

    try {
      const txHash = await defineBorrower(walletAddress, itemName, borrowerAddress)
      
      // TX Hash Proof message
      const successMessage = `✅ I lent ${itemName} to ${borrowerAddress.slice(0, 6)}...${borrowerAddress.slice(-4)} address.`
      setMessage(successMessage)
      setLastTxMessage(successMessage)
      setLastTxHash(txHash)
      
      // Clear inputs after success
      setItemName('')
      setBorrowerAddress('')
    } catch (error: any) {
      setMessage(`❌ Transaction failed: ${error.message || 'Unknown error'}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Contract function: Undefine Borrower
  const handleUndefineBorrower = async () => {
    if (!itemName) {
      setMessage('❌ Please enter item name')
      return
    }

    setLoading(true)
    setMessage('🔄 Preparing transaction... (Sign with Freighter)')

    try {
      const txHash = await undefineBorrower(walletAddress, itemName)
      
      // TX Hash Proof message
      const successMessage = `✅ I took ${itemName} back.`
      setMessage(successMessage)
      setLastTxMessage(successMessage)
      setLastTxHash(txHash)
      
      // Clear inputs after success
      setItemName('')
      setBorrowerAddress('')
    } catch (error: any) {
      setMessage(`❌ Transaction failed: ${error.message || 'Unknown error'}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // TX Hash copy function
  const copyTxHash = async () => {
    if (lastTxHash) {
      try {
        await navigator.clipboard.writeText(lastTxHash)
        setMessage('📋 TX Hash copied!')
        setTimeout(() => setMessage(lastTxMessage), 2000)
      } catch (error) {
        console.error('Copy error:', error)
        setMessage('❌ Copy failed')
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-white">TxLend</h1>
          <p className="text-purple-300 text-sm">Lending Tracker • Stellar Soroban</p>
        </div>
        <div>
          {isWalletConnected && walletAddress ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-purple-300">Connected Wallet</p>
                <p className="text-sm font-mono text-white">
                  {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                </p>
              </div>
              <button
                onClick={disconnectWallet}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg border border-red-500/30 transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={createWallet}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition shadow-lg"
              >
                🆕 Create Wallet
              </button>
              <button
                onClick={connectWallet}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-purple-500/50"
              >
                🔗 Connect Wallet
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
            <h2 className="text-2xl font-semibold text-white mb-4">Wallet Connection Required</h2>
            <div className="space-y-3 text-purple-300 max-w-md mx-auto">
              <p>✨ New user? Click <strong>"Create Wallet"</strong> to install Freighter extension.</p>
              <p>🔗 Already have Freighter? Click <strong>"Connect Wallet"</strong>.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Input Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Item Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. laptop, book, charger"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Borrower Address (Public Key)
                  </label>
                  <input
                    type="text"
                    placeholder="GXXXXXX... (Stellar address)"
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
                ⤴ I Lent It
              </button>
              
              <button
                onClick={handleUndefineBorrower}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition shadow-lg"
              >
                ⤵ I Took It Back
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
                <span className="px-4 bg-slate-900 text-purple-300">Transaction Proof</span>
              </div>
            </div>

            {/* TX Hash Proof Card */}
            {lastTxHash && (
              <div className="bg-green-600/10 backdrop-blur-md rounded-xl p-6 border border-green-500/30 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-4">🔗 Transaction Proof</h2>
                
                <div className="space-y-4">
                  <div className="bg-green-600/20 backdrop-blur-md rounded-lg p-4 border border-green-500/30">
                    <p className="text-sm text-green-300 mb-2">✅ Last Action:</p>
                    <p className="text-white font-medium">{lastTxMessage}</p>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <p className="text-sm text-purple-300 mb-2">🔗 Transaction Hash (Proof):</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-white text-sm break-all flex-1">
                        {lastTxHash}
                      </p>
                      <button
                        onClick={copyTxHash}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition"
                    >
                      🔍 View in Explorer
                    </a>
                    <button
                      onClick={() => {
                        setLastTxHash('')
                        setLastTxMessage('')
                        setMessage('')
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/30">
              <p className="text-sm text-blue-200">
                ℹ️ <strong>Write-Only Proof System:</strong> Every transaction is recorded on the Stellar blockchain and can be proven with a Transaction Hash. Only write operations (define/undefine) are supported.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full p-4 text-center text-purple-300 text-sm backdrop-blur-sm bg-black/20">
        Built on Stellar Testnet • Soroban Smart Contract • Write-Only Proof System
      </footer>
    </main>
  )
}

