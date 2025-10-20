import '@testing-library/jest-dom'

// Mock Freighter API
jest.mock('@stellar/freighter-api', () => ({
  isConnected: jest.fn(() => Promise.resolve(false)),
  requestAccess: jest.fn(() => Promise.resolve('GABC123...XYZ789')),
  signTransaction: jest.fn(() => Promise.resolve('mock-signed-xdr')),
}))

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

// Mock window.open
global.open = jest.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}
