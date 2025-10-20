import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'
import { isConnected, requestAccess } from '@stellar/freighter-api'
import { defineBorrower, undefineBorrower } from '../contract'

// Mock the contract functions
jest.mock('../contract', () => ({
  defineBorrower: jest.fn(),
  undefineBorrower: jest.fn(),
}))

// Mock Freighter API
jest.mock('@stellar/freighter-api', () => ({
  isConnected: jest.fn(),
  requestAccess: jest.fn(),
}))

const mockDefineBorrower = defineBorrower as jest.MockedFunction<typeof defineBorrower>
const mockUndefineBorrower = undefineBorrower as jest.MockedFunction<typeof undefineBorrower>
const mockIsConnected = isConnected as jest.MockedFunction<typeof isConnected>
const mockRequestAccess = requestAccess as jest.MockedFunction<typeof requestAccess>

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsConnected.mockResolvedValue(false)
    mockRequestAccess.mockResolvedValue('GABC123...XYZ789')
  })

  describe('Initial Render', () => {
    it('should render the header with title and subtitle', () => {
      render(<Home />)
      
      expect(screen.getByText('TxLend')).toBeInTheDocument()
      expect(screen.getByText('Lending Tracker • Stellar Soroban')).toBeInTheDocument()
    })

    it('should show wallet connection required when not connected', () => {
      render(<Home />)
      
      expect(screen.getByText('Wallet Connection Required')).toBeInTheDocument()
      expect(screen.getByText(/Connect Wallet/)).toBeInTheDocument()
      expect(screen.getByText(/Create Wallet/)).toBeInTheDocument()
    })

    it('should check connection on mount', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(mockIsConnected).toHaveBeenCalled()
      })
    })
  })

  describe('Wallet Connection', () => {
    it('should connect wallet successfully', async () => {
      const user = userEvent.setup()
      mockIsConnected.mockResolvedValue(false)
      mockRequestAccess.mockResolvedValue('GABC123...XYZ789')

      render(<Home />)
      
      const connectButton = screen.getByText('Connect Wallet')
      await user.click(connectButton)

      await waitFor(() => {
        expect(screen.getByText('✅ Wallet connected!')).toBeInTheDocument()
        expect(screen.getByText('GABC123...XYZ789')).toBeInTheDocument()
      })
    })

    it('should handle wallet connection failure', async () => {
      const user = userEvent.setup()
      mockRequestAccess.mockRejectedValue(new Error('User declined access'))

      render(<Home />)
      
      const connectButton = screen.getByText('Connect Wallet')
      await user.click(connectButton)

      await waitFor(() => {
        expect(screen.getByText('❌ Wallet connection declined')).toBeInTheDocument()
      })
    })

    it('should handle missing Freighter extension', async () => {
      const user = userEvent.setup()
      mockRequestAccess.mockRejectedValue(new Error('Freighter not installed'))

      render(<Home />)
      
      const connectButton = screen.getByText('Connect Wallet')
      await user.click(connectButton)

      await waitFor(() => {
        expect(screen.getByText('❌ Please install Freighter extension and refresh the page!')).toBeInTheDocument()
      })
    })

    it('should open Freighter download page when Create Wallet is clicked', () => {
      const mockOpen = jest.fn()
      window.open = mockOpen

      render(<Home />)
      
      const createButton = screen.getByText('Create Wallet')
      fireEvent.click(createButton)

      expect(mockOpen).toHaveBeenCalledWith('https://www.freighter.app/', '_blank')
    })

    it('should disconnect wallet', async () => {
      const user = userEvent.setup()
      mockIsConnected.mockResolvedValue(true)
      mockRequestAccess.mockResolvedValue('GABC123...XYZ789')

      render(<Home />)
      
      // Wait for auto-connection
      await waitFor(() => {
        expect(screen.getByText('GABC123...XYZ789')).toBeInTheDocument()
      })

      const disconnectButton = screen.getByText('Disconnect')
      await user.click(disconnectButton)

      expect(screen.getByText('Wallet disconnected')).toBeInTheDocument()
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    })
  })

  describe('Define Borrower (Lend Item)', () => {
    beforeEach(async () => {
      mockIsConnected.mockResolvedValue(true)
      mockRequestAccess.mockResolvedValue('GABC123...XYZ789')
      mockDefineBorrower.mockResolvedValue('mock-tx-hash-123')
    })

    it('should render form fields when wallet is connected', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Borrower Address (Public Key)')).toBeInTheDocument()
        expect(screen.getByText('⤴ I Lent It')).toBeInTheDocument()
        expect(screen.getByText('⤵ I Took It Back')).toBeInTheDocument()
      })
    })

    it('should successfully define a borrower', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
      })

      const itemNameInput = screen.getByLabelText('Item Name')
      const borrowerAddressInput = screen.getByLabelText('Borrower Address (Public Key)')
      const lendButton = screen.getByText('⤴ I Lent It')

      await user.type(itemNameInput, 'Test Laptop')
      await user.type(borrowerAddressInput, 'GDEF456...ABC123')
      await user.click(lendButton)

      await waitFor(() => {
        expect(mockDefineBorrower).toHaveBeenCalledWith(
          'GABC123...XYZ789',
          'Test Laptop',
          'GDEF456...ABC123'
        )
        expect(screen.getByText(/✅ I lent Test Laptop to GDEF456...ABC123/)).toBeInTheDocument()
      })
    })

    it('should show error when fields are empty', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('⤴ I Lent It')).toBeInTheDocument()
      })

      const lendButton = screen.getByText('⤴ I Lent It')
      await user.click(lendButton)

      expect(screen.getByText('❌ Please fill all fields')).toBeInTheDocument()
      expect(mockDefineBorrower).not.toHaveBeenCalled()
    })

    it('should handle define borrower error', async () => {
      const user = userEvent.setup()
      mockDefineBorrower.mockRejectedValue(new Error('Transaction failed'))

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
      })

      const itemNameInput = screen.getByLabelText('Item Name')
      const borrowerAddressInput = screen.getByLabelText('Borrower Address (Public Key)')
      const lendButton = screen.getByText('⤴ I Lent It')

      await user.type(itemNameInput, 'Test Laptop')
      await user.type(borrowerAddressInput, 'GDEF456...ABC123')
      await user.click(lendButton)

      await waitFor(() => {
        expect(screen.getByText('❌ Transaction failed: Transaction failed')).toBeInTheDocument()
      })
    })

    it('should clear inputs after successful transaction', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
      })

      const itemNameInput = screen.getByLabelText('Item Name')
      const borrowerAddressInput = screen.getByLabelText('Borrower Address (Public Key)')
      const lendButton = screen.getByText('⤴ I Lent It')

      await user.type(itemNameInput, 'Test Laptop')
      await user.type(borrowerAddressInput, 'GDEF456...ABC123')
      await user.click(lendButton)

      await waitFor(() => {
        expect(itemNameInput).toHaveValue('')
        expect(borrowerAddressInput).toHaveValue('')
      })
    })
  })

  describe('Undefine Borrower (Take Back Item)', () => {
    beforeEach(async () => {
      mockIsConnected.mockResolvedValue(true)
      mockRequestAccess.mockResolvedValue('GABC123...XYZ789')
      mockUndefineBorrower.mockResolvedValue('mock-tx-hash-456')
    })

    it('should successfully undefine a borrower', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
      })

      const itemNameInput = screen.getByLabelText('Item Name')
      const takeBackButton = screen.getByText('⤵ I Took It Back')

      await user.type(itemNameInput, 'Test Laptop')
      await user.click(takeBackButton)

      await waitFor(() => {
        expect(mockUndefineBorrower).toHaveBeenCalledWith(
          'GABC123...XYZ789',
          'Test Laptop'
        )
        expect(screen.getByText('✅ I took Test Laptop back.')).toBeInTheDocument()
      })
    })

    it('should show error when item name is empty', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('⤵ I Took It Back')).toBeInTheDocument()
      })

      const takeBackButton = screen.getByText('⤵ I Took It Back')
      await user.click(takeBackButton)

      expect(screen.getByText('❌ Please enter item name')).toBeInTheDocument()
      expect(mockUndefineBorrower).not.toHaveBeenCalled()
    })

    it('should handle undefine borrower error', async () => {
      const user = userEvent.setup()
      mockUndefineBorrower.mockRejectedValue(new Error('Item not found'))

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
      })

      const itemNameInput = screen.getByLabelText('Item Name')
      const takeBackButton = screen.getByText('⤵ I Took It Back')

      await user.type(itemNameInput, 'Non-existent Item')
      await user.click(takeBackButton)

      await waitFor(() => {
        expect(screen.getByText('❌ Transaction failed: Item not found')).toBeInTheDocument()
      })
    })
  })

  describe('Transaction Hash Display', () => {
    beforeEach(async () => {
      mockIsConnected.mockResolvedValue(true)
      mockRequestAccess.mockResolvedValue('GABC123...XYZ789')
      mockDefineBorrower.mockResolvedValue('mock-tx-hash-123')
    })

    it('should display transaction hash after successful transaction', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
      })

      const itemNameInput = screen.getByLabelText('Item Name')
      const borrowerAddressInput = screen.getByLabelText('Borrower Address (Public Key)')
      const lendButton = screen.getByText('⤴ I Lent It')

      await user.type(itemNameInput, 'Test Laptop')
      await user.type(borrowerAddressInput, 'GDEF456...ABC123')
      await user.click(lendButton)

      await waitFor(() => {
        expect(screen.getByText('🔗 Transaction Proof')).toBeInTheDocument()
        expect(screen.getByText('mock-tx-hash-123')).toBeInTheDocument()
        expect(screen.getByText('🔍 View in Explorer')).toBeInTheDocument()
        expect(screen.getByText('📋 Copy')).toBeInTheDocument()
      })
    })

    it('should copy transaction hash to clipboard', async () => {
      const user = userEvent.setup()
      const mockWriteText = jest.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
      })

      const itemNameInput = screen.getByLabelText('Item Name')
      const borrowerAddressInput = screen.getByLabelText('Borrower Address (Public Key)')
      const lendButton = screen.getByText('⤴ I Lent It')

      await user.type(itemNameInput, 'Test Laptop')
      await user.type(borrowerAddressInput, 'GDEF456...ABC123')
      await user.click(lendButton)

      await waitFor(() => {
        expect(screen.getByText('📋 Copy')).toBeInTheDocument()
      })

      const copyButton = screen.getByText('📋 Copy')
      await user.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith('mock-tx-hash-123')
      expect(screen.getByText('📋 TX Hash copied!')).toBeInTheDocument()
    })

    it('should clear transaction proof', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
      })

      const itemNameInput = screen.getByLabelText('Item Name')
      const borrowerAddressInput = screen.getByLabelText('Borrower Address (Public Key)')
      const lendButton = screen.getByText('⤴ I Lent It')

      await user.type(itemNameInput, 'Test Laptop')
      await user.type(borrowerAddressInput, 'GDEF456...ABC123')
      await user.click(lendButton)

      await waitFor(() => {
        expect(screen.getByText('✕ Clear')).toBeInTheDocument()
      })

      const clearButton = screen.getByText('✕ Clear')
      await user.click(clearButton)

      expect(screen.queryByText('🔗 Transaction Proof')).not.toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    beforeEach(async () => {
      mockIsConnected.mockResolvedValue(true)
      mockRequestAccess.mockResolvedValue('GABC123...XYZ789')
    })

    it('should show loading state during transaction', async () => {
      const user = userEvent.setup()
      mockDefineBorrower.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('mock-tx-hash'), 100)))

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
      })

      const itemNameInput = screen.getByLabelText('Item Name')
      const borrowerAddressInput = screen.getByLabelText('Borrower Address (Public Key)')
      const lendButton = screen.getByText('⤴ I Lent It')

      await user.type(itemNameInput, 'Test Laptop')
      await user.type(borrowerAddressInput, 'GDEF456...ABC123')
      await user.click(lendButton)

      expect(screen.getByText('🔄 Preparing transaction... (Sign with Freighter)')).toBeInTheDocument()
      expect(lendButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', async () => {
      mockIsConnected.mockResolvedValue(true)
      mockRequestAccess.mockResolvedValue('GABC123...XYZ789')

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Borrower Address (Public Key)')).toBeInTheDocument()
      })
    })

    it('should have proper button labels', async () => {
      mockIsConnected.mockResolvedValue(true)
      mockRequestAccess.mockResolvedValue('GABC123...XYZ789')

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '⤴ I Lent It' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '⤵ I Took It Back' })).toBeInTheDocument()
      })
    })
  })
})
