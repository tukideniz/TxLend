import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../page'

// Mock contract functions
jest.mock('../contract', () => ({
  defineBorrower: jest.fn(),
  undefineBorrower: jest.fn(),
}))

describe('TxLend Basic Tests', () => {
  describe('Component Rendering', () => {
    it('should render the application title', () => {
      render(<Home />)
      expect(screen.getByText('TxLend')).toBeInTheDocument()
    })

    it('should render the application subtitle', () => {
      render(<Home />)
      expect(screen.getByText('Lending Tracker • Stellar Soroban')).toBeInTheDocument()
    })

    it('should render the footer', () => {
      render(<Home />)
      expect(screen.getByText(/Built on Stellar Testnet/)).toBeInTheDocument()
      expect(screen.getByText(/Soroban Smart Contract/)).toBeInTheDocument()
    })

    it('should render wallet connection buttons when disconnected', () => {
      render(<Home />)
      const connectButtons = screen.getAllByText(/Connect Wallet/)
      const createButtons = screen.getAllByText(/Create Wallet/)
      expect(connectButtons.length).toBeGreaterThan(0)
      expect(createButtons.length).toBeGreaterThan(0)
    })

    it('should render wallet connection required message', () => {
      render(<Home />)
      expect(screen.getByText('Wallet Connection Required')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<Home />)
      const heading = screen.getByRole('heading', { name: 'TxLend' })
      expect(heading).toBeInTheDocument()
    })

    it('should have connect wallet button', () => {
      render(<Home />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('UI Elements', () => {
    it('should display correct text content', () => {
      render(<Home />)
      expect(screen.getByText(/New user/)).toBeInTheDocument()
      expect(screen.getByText(/Already have Freighter/)).toBeInTheDocument()
    })

    it('should render header section', () => {
      const { container } = render(<Home />)
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('should render footer section', () => {
      const { container } = render(<Home />)
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })
  })
})

