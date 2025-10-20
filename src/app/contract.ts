"use client"
import { signTransaction } from '@stellar/freighter-api'

// Contract ID (Deployed to Stellar Testnet)
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'CCU4KAUC6AFHKLQ7BP2HPW4VSXHEJVVQIXTE3IEH7J2JOPQPM2CGECQM'

// Testnet RPC endpoint
const RPC_URL = 'https://soroban-testnet.stellar.org'
// NETWORK_PASSPHRASE ve SDK import'u runtime'da alınacak

/**
 * Define Borrower - Eşyanın sorumluluğunu tanımla
 */
export async function defineBorrower(
  lenderAddress: string,
  itemName: string,
  borrowerAddress: string
): Promise<string> {
  try {
    const StellarSdk = await import('@stellar/stellar-sdk')
    // Soroban RPC namespace'i resolve et
    const SorobanNs: any =
      (StellarSdk as any).SorobanRpc ||
      (StellarSdk as any).Soroban ||
      ((StellarSdk as any).default && ((StellarSdk as any).default.SorobanRpc || (StellarSdk as any).default.Soroban))
    if (!SorobanNs?.Server) {
      throw new Error('Soroban RPC not available in SDK')
    }
    const NETWORK_PASSPHRASE = (StellarSdk as any).Networks.TESTNET
    const server = new SorobanNs.Server(RPC_URL)

    // Account bilgisi al
    const sourceAccount = await server.getAccount(lenderAddress)

    // Contract parametrelerini hazırla
    const contract = new (StellarSdk as any).Contract(CONTRACT_ID)
    
    const tx = new (StellarSdk as any).TransactionBuilder(sourceAccount, {
      fee: (StellarSdk as any).BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'define_borrower',
          (StellarSdk as any).Address.fromString(lenderAddress).toScVal(), // lender
          (StellarSdk as any).nativeToScVal(itemName, { type: 'symbol' }), // item_name
          (StellarSdk as any).Address.fromString(borrowerAddress).toScVal() // borrower
        )
      )
      .setTimeout(30)
      .build()

    // Transaction'ı simüle et
    const simulated = await server.simulateTransaction(tx)

    const simIsError = SorobanNs?.Api?.isSimulationError
      ? SorobanNs.Api.isSimulationError(simulated)
      : Boolean((simulated as any)?.error)
    if (simIsError) {
      throw new Error(`Simulation failed: ${(simulated as any)?.error || 'unknown'}`)
    }

    // Prepare edilmiş transaction
    const assembleFn = SorobanNs?.assembleTransaction
    if (!assembleFn) {
      throw new Error('Soroban RPC assembleTransaction not available')
    }
    const preparedTx = assembleFn(tx, simulated).build()

    // Freighter ile imzala
    const signedXDR = await signTransaction(preparedTx.toXDR(), {
      network: 'TESTNET',
    })

    console.log('Signed XDR:', signedXDR)

    // İmzalanmış transaction'ı oluştur
    // Freighter returns string directly
    const xdrString = signedXDR
    const signedTx = (StellarSdk as any).TransactionBuilder.fromXDR(
      xdrString,
      NETWORK_PASSPHRASE
    )

    // Network'e gönder
    const result = await server.sendTransaction(signedTx as any)
    
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
    const StellarSdk = await import('@stellar/stellar-sdk')
    const SorobanNs: any =
      (StellarSdk as any).SorobanRpc ||
      (StellarSdk as any).Soroban ||
      ((StellarSdk as any).default && ((StellarSdk as any).default.SorobanRpc || (StellarSdk as any).default.Soroban))
    if (!SorobanNs?.Server) {
      throw new Error('Soroban RPC not available in SDK')
    }
    const NETWORK_PASSPHRASE = (StellarSdk as any).Networks.TESTNET
    const server = new SorobanNs.Server(RPC_URL)

    const sourceAccount = await server.getAccount(lenderAddress)

    const contract = new (StellarSdk as any).Contract(CONTRACT_ID)
    
    const tx = new (StellarSdk as any).TransactionBuilder(sourceAccount, {
      fee: (StellarSdk as any).BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'undefine_borrower',
          (StellarSdk as any).Address.fromString(lenderAddress).toScVal(), // lender
          (StellarSdk as any).nativeToScVal(itemName, { type: 'symbol' }) // item_name
        )
      )
      .setTimeout(30)
      .build()

    const simulated = await server.simulateTransaction(tx)

    const simIsError2 = SorobanNs?.Api?.isSimulationError
      ? SorobanNs.Api.isSimulationError(simulated)
      : Boolean((simulated as any)?.error)
    if (simIsError2) {
      throw new Error(`Simulation failed: ${(simulated as any)?.error || 'unknown'}`)
    }

    const assembleFn2 = SorobanNs?.assembleTransaction
    if (!assembleFn2) {
      throw new Error('Soroban RPC assembleTransaction not available')
    }
    const preparedTx = assembleFn2(tx, simulated).build()

    const signedXDR = await signTransaction(preparedTx.toXDR(), {
      network: 'TESTNET',
    })

    // Freighter returns string directly
    const xdrString = signedXDR
    const signedTx = (StellarSdk as any).TransactionBuilder.fromXDR(
      xdrString,
      NETWORK_PASSPHRASE
    )

    const result = await server.sendTransaction(signedTx as any)
    
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