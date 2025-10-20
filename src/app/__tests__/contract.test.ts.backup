import { defineBorrower, undefineBorrower } from '../contract'
import { signTransaction } from '@stellar/freighter-api'

// Mock the Stellar SDK
const mockServer = {
  getAccount: jest.fn(),
  simulateTransaction: jest.fn(),
  sendTransaction: jest.fn(),
}

const mockSorobanRpc = {
  Server: jest.fn(() => mockServer),
  Api: {
    isSimulationError: jest.fn(),
  },
  assembleTransaction: jest.fn(),
}

const mockStellarSdk = {
  Networks: {
    TESTNET: 'Test SDF Network ; September 2015',
  },
  BASE_FEE: '100',
  Address: {
    fromString: jest.fn((address) => ({
      toScVal: () => ({ address }),
    })),
  },
  nativeToScVal: jest.fn((value, type) => ({ value, type })),
  Contract: jest.fn(() => ({
    call: jest.fn((method, ...args) => ({
      method,
      args,
    })),
  })),
  TransactionBuilder: jest.fn(() => ({
    addOperation: jest.fn().mockReturnThis(),
    setTimeout: jest.fn().mockReturnThis(),
    build: jest.fn(() => ({
      toXDR: () => 'mock-xdr',
    })),
  })),
  TransactionBuilder: {
    fromXDR: jest.fn((xdr, network) => ({
      toXDR: () => xdr,
    })),
  },
}

// Mock the dynamic import
jest.mock('@stellar/stellar-sdk', () => mockStellarSdk)

// Mock Freighter API
jest.mock('@stellar/freighter-api', () => ({
  signTransaction: jest.fn(),
}))

describe('Contract Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockServer.getAccount.mockResolvedValue({
      accountId: 'GABC123...XYZ789',
      sequenceNumber: '123456',
    })
    
    mockServer.simulateTransaction.mockResolvedValue({
      result: { xdr: 'mock-simulation-result' },
    })
    
    mockServer.sendTransaction.mockResolvedValue({
      hash: 'mock-transaction-hash-123',
      status: 'PENDING',
    })
    
    mockSorobanRpc.Api.isSimulationError.mockReturnValue(false)
    mockSorobanRpc.assembleTransaction.mockReturnValue({
      build: jest.fn(() => ({
        toXDR: () => 'mock-prepared-xdr',
      })),
    })
    
    // Mock the dynamic import to return our mocked SDK
    jest.doMock('@stellar/stellar-sdk', () => ({
      ...mockStellarSdk,
      SorobanRpc: mockSorobanRpc,
    }))
    
    ;(signTransaction as jest.Mock).mockResolvedValue('mock-signed-xdr')
  })

  describe('defineBorrower', () => {
    it('should successfully define a borrower and return transaction hash', async () => {
      const lenderAddress = 'GABC123...XYZ789'
      const itemName = 'Test Laptop'
      const borrowerAddress = 'GDEF456...ABC123'

      const result = await defineBorrower(lenderAddress, itemName, borrowerAddress)

      expect(result).toBe('mock-transaction-hash-123')
      expect(mockServer.getAccount).toHaveBeenCalledWith(lenderAddress)
      expect(mockServer.simulateTransaction).toHaveBeenCalled()
      expect(signTransaction).toHaveBeenCalledWith('mock-prepared-xdr', {
        network: 'TESTNET',
      })
      expect(mockServer.sendTransaction).toHaveBeenCalled()
    })

    it('should handle simulation errors', async () => {
      mockSorobanRpc.Api.isSimulationError.mockReturnValue(true)
      mockServer.simulateTransaction.mockResolvedValue({
        error: 'Simulation failed: insufficient balance',
      })

      await expect(
        defineBorrower('GABC123...XYZ789', 'Test Item', 'GDEF456...ABC123')
      ).rejects.toThrow('Simulation failed: insufficient balance')
    })

    it('should handle missing Soroban RPC', async () => {
      // Mock the dynamic import to return SDK without SorobanRpc
      jest.doMock('@stellar/stellar-sdk', () => mockStellarSdk)

      await expect(
        defineBorrower('GABC123...XYZ789', 'Test Item', 'GDEF456...ABC123')
      ).rejects.toThrow('Soroban RPC not available in SDK')
    })

    it('should handle missing assembleTransaction function', async () => {
      mockSorobanRpc.assembleTransaction = undefined

      await expect(
        defineBorrower('GABC123...XYZ789', 'Test Item', 'GDEF456...ABC123')
      ).rejects.toThrow('Soroban RPC assembleTransaction not available')
    })

    it('should handle Freighter signing errors', async () => {
      ;(signTransaction as jest.Mock).mockRejectedValue(new Error('User declined'))

      await expect(
        defineBorrower('GABC123...XYZ789', 'Test Item', 'GDEF456...ABC123')
      ).rejects.toThrow('User declined')
    })

    it('should handle network errors', async () => {
      mockServer.sendTransaction.mockRejectedValue(new Error('Network error'))

      await expect(
        defineBorrower('GABC123...XYZ789', 'Test Item', 'GDEF456...ABC123')
      ).rejects.toThrow('Network error')
    })
  })

  describe('undefineBorrower', () => {
    it('should successfully undefine a borrower and return transaction hash', async () => {
      const lenderAddress = 'GABC123...XYZ789'
      const itemName = 'Test Laptop'

      const result = await undefineBorrower(lenderAddress, itemName)

      expect(result).toBe('mock-transaction-hash-123')
      expect(mockServer.getAccount).toHaveBeenCalledWith(lenderAddress)
      expect(mockServer.simulateTransaction).toHaveBeenCalled()
      expect(signTransaction).toHaveBeenCalledWith('mock-prepared-xdr', {
        network: 'TESTNET',
      })
      expect(mockServer.sendTransaction).toHaveBeenCalled()
    })

    it('should handle simulation errors', async () => {
      mockSorobanRpc.Api.isSimulationError.mockReturnValue(true)
      mockServer.simulateTransaction.mockResolvedValue({
        error: 'Simulation failed: item not found',
      })

      await expect(
        undefineBorrower('GABC123...XYZ789', 'Non-existent Item')
      ).rejects.toThrow('Simulation failed: item not found')
    })

    it('should handle missing Soroban RPC', async () => {
      jest.doMock('@stellar/stellar-sdk', () => mockStellarSdk)

      await expect(
        undefineBorrower('GABC123...XYZ789', 'Test Item')
      ).rejects.toThrow('Soroban RPC not available in SDK')
    })

    it('should handle Freighter signing errors', async () => {
      ;(signTransaction as jest.Mock).mockRejectedValue(new Error('User declined'))

      await expect(
        undefineBorrower('GABC123...XYZ789', 'Test Item')
      ).rejects.toThrow('User declined')
    })

    it('should handle network errors', async () => {
      mockServer.sendTransaction.mockRejectedValue(new Error('Network error'))

      await expect(
        undefineBorrower('GABC123...XYZ789', 'Test Item')
      ).rejects.toThrow('Network error')
    })
  })

  describe('Input Validation', () => {
    it('should handle empty item name in defineBorrower', async () => {
      await expect(
        defineBorrower('GABC123...XYZ789', '', 'GDEF456...ABC123')
      ).resolves.toBe('mock-transaction-hash-123')
    })

    it('should handle empty borrower address in defineBorrower', async () => {
      await expect(
        defineBorrower('GABC123...XYZ789', 'Test Item', '')
      ).resolves.toBe('mock-transaction-hash-123')
    })

    it('should handle empty item name in undefineBorrower', async () => {
      await expect(
        undefineBorrower('GABC123...XYZ789', '')
      ).resolves.toBe('mock-transaction-hash-123')
    })
  })

  describe('Contract Integration', () => {
    it('should call correct contract method for defineBorrower', async () => {
      const mockContract = {
        call: jest.fn(),
      }
      mockStellarSdk.Contract.mockReturnValue(mockContract)

      await defineBorrower('GABC123...XYZ789', 'Test Item', 'GDEF456...ABC123')

      expect(mockContract.call).toHaveBeenCalledWith(
        'define_borrower',
        expect.any(Object), // lender address
        expect.any(Object), // item name
        expect.any(Object)  // borrower address
      )
    })

    it('should call correct contract method for undefineBorrower', async () => {
      const mockContract = {
        call: jest.fn(),
      }
      mockStellarSdk.Contract.mockReturnValue(mockContract)

      await undefineBorrower('GABC123...XYZ789', 'Test Item')

      expect(mockContract.call).toHaveBeenCalledWith(
        'undefine_borrower',
        expect.any(Object), // lender address
        expect.any(Object)  // item name
      )
    })
  })

  describe('Error Handling', () => {
    it('should log errors and re-throw them', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockServer.getAccount.mockRejectedValue(new Error('Account not found'))

      await expect(
        defineBorrower('GABC123...XYZ789', 'Test Item', 'GDEF456...ABC123')
      ).rejects.toThrow('Account not found')

      expect(consoleSpy).toHaveBeenCalledWith(
        'defineBorrower error:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle unknown simulation errors', async () => {
      mockServer.simulateTransaction.mockResolvedValue({
        error: undefined,
      })
      mockSorobanRpc.Api.isSimulationError.mockReturnValue(true)

      await expect(
        defineBorrower('GABC123...XYZ789', 'Test Item', 'GDEF456...ABC123')
      ).rejects.toThrow('Simulation failed: unknown')
    })
  })
})
