import * as StellarSdk from '@stellar/stellar-sdk'
import { signTransaction } from '@stellar/freighter-api'

// Contract ID (Deployed to Stellar Testnet)
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'CDXDBMLM6NMKLTUQJOZUDAIKGAXPJKIEVEBIOIAJR5NMPK4X3C6IUXII'

// Testnet RPC endpoint
const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET

const server = new StellarSdk.SorobanRpc.Server(RPC_URL)

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
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`)
    }

    // Prepare edilmiş transaction
    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(tx, simulated).build()

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
    
    console.log('✅ Transaction sent successfully!')
    console.log('Transaction Hash:', result.hash)
    console.log('Status:', result.status)
    
    // Transaction gönderildi, hash'i dön
    // Network işlemi birkaç saniye sürebilir ama transaction başarıyla gönderildi
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
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`)
    }

    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(tx, simulated).build()

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
    
    console.log('✅ Transaction sent successfully!')
    console.log('Transaction Hash:', result.hash)
    console.log('Status:', result.status)
    
    // Transaction gönderildi, hash'i dön
    return result.hash
  } catch (error) {
    console.error('undefineBorrower error:', error)
    throw error
  }
}

/**
 * Get Current Definition - Eşyanın mevcut sorumlusunu sorgula
 */
export async function getCurrentDefinition(itemName: string): Promise<string | null> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID)
    
    // Dummy account (okuma işlemi için herhangi bir adres kullanılabilir)
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      '0'
    )

    const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'get_current_definition',
          StellarSdk.nativeToScVal(itemName, { type: 'symbol' }) // item_name
        )
      )
      .setTimeout(30)
      .build()

    // Simüle et (okuma işlemi için yeterli)
    const simulated = await server.simulateTransaction(tx)
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`)
    }

    if (!simulated.result) {
      return null
    }

    // Sonucu decode et
    const result = simulated.result.retval
    
    // Option<Address> tipini kontrol et
    if (result.switch().name === 'scvVoid') {
      return null
    }

    // Address'i string'e çevir
    const address = StellarSdk.Address.fromScVal(result.value() as any)
    return address.toString()
  } catch (error) {
    console.error('getCurrentDefinition error:', error)
    return null
  }
}