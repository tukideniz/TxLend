import * as StellarSdk from '@stellar/stellar-sdk'
import { signTransaction } from '@stellar/freighter-api'

// Contract ID (Deployed to Stellar Testnet)
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'CDXDBMLM6NMKLTUQJOZUDAIKGAXPJKIEVEBIOIAJR5NMPK4X3C6IUXII'

// Testnet RPC endpoint
const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET

const server = new StellarSdk.rpc.Server(RPC_URL)

/**
 * Define Borrower - Eşyanın sorumluluğunu tanımla
 */
export async function defineBorrower(
  lenderAddress: string,
  itemName: string,
  borrowerAddress: string
): Promise<string> {
  try {
    // Account bilgisi al
    const sourceAccount = await server.getAccount(lenderAddress)

    // Contract parametrelerini hazırla
    const contract = new StellarSdk.Contract(CONTRACT_ID)
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'define_borrower',
          StellarSdk.Address.fromString(lenderAddress).toScVal(), // lender
          StellarSdk.nativeToScVal(itemName, { type: 'symbol' }), // item_name
          StellarSdk.Address.fromString(borrowerAddress).toScVal() // borrower
        )
      )
      .setTimeout(30)
      .build()

    // Transaction'ı simüle et
    const simulated = await server.simulateTransaction(tx)
    
    if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`)
    }

    // Prepare edilmiş transaction
    const preparedTx = StellarSdk.rpc.assembleTransaction(tx, simulated).build()

    // Freighter ile imzala
    const signedXDR = await signTransaction(preparedTx.toXDR(), {
      network: 'TESTNET',
    })

    console.log('Signed XDR:', signedXDR)

    // İmzalanmış transaction'ı oluştur
    // Freighter returns string directly
    const xdrString = signedXDR
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      xdrString,
      NETWORK_PASSPHRASE
    )

    // Network'e gönder
    const result = await server.sendTransaction(signedTx as StellarSdk.Transaction)
    
    console.log('✅ I Lent It Transaction sent successfully!')
    console.log('Transaction Hash:', result.hash)
    console.log('Status:', result.status)
    
    // Write-Only Proof: Sadece TX Hash döndür
    return result.hash
  } catch (error) {
    console.error('defineBorrower error:', error)
    throw error
  }
}

/**
 * Undefine Borrower - Eşyanın tanımını kaldır
 */
export async function undefineBorrower(
  lenderAddress: string,
  itemName: string
): Promise<string> {
  try {
    const sourceAccount = await server.getAccount(lenderAddress)

    const contract = new StellarSdk.Contract(CONTRACT_ID)
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'undefine_borrower',
          StellarSdk.Address.fromString(lenderAddress).toScVal(), // lender
          StellarSdk.nativeToScVal(itemName, { type: 'symbol' }) // item_name
        )
      )
      .setTimeout(30)
      .build()

    const simulated = await server.simulateTransaction(tx)
    
    if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`)
    }

    const preparedTx = StellarSdk.rpc.assembleTransaction(tx, simulated).build()

    const signedXDR = await signTransaction(preparedTx.toXDR(), {
      network: 'TESTNET',
    })

    // Freighter returns string directly
    const xdrString = signedXDR
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      xdrString,
      NETWORK_PASSPHRASE
    )

    const result = await server.sendTransaction(signedTx as StellarSdk.Transaction)
    
    console.log('✅ I Took It Back Transaction sent successfully!')
    console.log('Transaction Hash:', result.hash)
    console.log('Status:', result.status)
    
    // Write-Only Proof: Sadece TX Hash döndür
    return result.hash
  } catch (error) {
    console.error('undefineBorrower error:', error)
    throw error
  }
}

// Write-Only Proof System - Query fonksiyonları kaldırıldı
// Sadece yazma işlemleri (define/undefine) kullanılacak