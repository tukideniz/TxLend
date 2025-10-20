# TxLend - Blockchain-Based Item Tracking dApp

![TxLend Logo](src/app/icon.png)

## 📋 Project Details

TxLend is a minimalist Stellar Soroban dApp that leverages the secure data recording power of blockchain technology to address a real-world need beyond financial transactions. The project focuses on eliminating the "Who had this?" uncertainty in daily life by providing an immutable, blockchain-based record of borrowed items.

**Core Concept:** Instead of complex financial applications, TxLend tackles the simple yet common problem of tracking small borrowed items (books, tools, etc.) in everyday life. Users can record who they've lent an item to using wallet addresses, and remove that record when the item is returned.

**Key Innovation:** The app uses a `require auth` mechanism ensuring only the actual lender can create records, preventing unauthorized entries. This creates an undeniable responsibility record at the contract level, making it impossible for someone else to create false lending records on your behalf.

**Minimalist Approach:** With just 3 core functions and Freighter Wallet integration, TxLend demonstrates how blockchain can serve as a trust and responsibility ledger in the simplest, most elegant way possible.

## 🎯 Vision

TxLend envisions a world where trust and responsibility in everyday interactions are seamlessly recorded and verified through blockchain technology. By solving the simple yet universal problem of "Who had this?", we aim to create a foundation for broader adoption of blockchain in non-financial applications. Our vision is to make blockchain technology accessible to everyone, starting with the most basic human need: keeping track of borrowed items. We believe that by starting simple and solving real problems, we can bridge the gap between complex blockchain technology and everyday life, ultimately creating a more transparent and trustworthy society where even the smallest interactions are recorded with immutable proof.

## 👨‍💻 About Me

**Name:** Blockchain Developer & Problem Solver

As a passionate developer focused on practical blockchain applications, I believe that the true power of blockchain technology lies not in complex financial instruments, but in solving everyday problems that affect millions of people. My journey began with the realization that while most blockchain projects focus on DeFi and complex financial applications, there are countless real-world problems that can be elegantly solved with simple, secure, and immutable record-keeping.

TxLend represents my philosophy of "blockchain for everyone" - creating solutions that are so simple and useful that even non-technical users can benefit from the security and transparency that blockchain provides. I'm driven by the belief that technology should serve humanity, not the other way around, and that the best innovations often come from addressing the most basic human needs with the most advanced tools available.

## 🛠️ Software Development Plan

### Phase 1: Smart Contract Development
- **Step 1:** Design and implement core smart contract functions (`define_borrower`, `undefine_borrower`, `get_borrower`)
- **Step 2:** Implement `require auth` mechanism for security and add input validation
- **Step 3:** Deploy and test smart contract on Stellar Testnet

### Phase 2: Frontend Development  
- **Step 4:** Build responsive Next.js frontend with Freighter Wallet integration
- **Step 5:** Implement user-friendly interface with transaction status tracking
- **Step 6:** Deploy to production and optimize for real-world usage

## 🌟 Features

- **Blockchain-Based Tracking**: Every transaction is recorded on the Stellar blockchain with immutable proof
- **Simple Interface**: Clean, user-friendly design with just 3 core functions
- **Freighter Wallet Integration**: Seamless wallet connection for Stellar ecosystem
- **Write-Only Proof System**: Only write operations (define/undefine) are supported for maximum security
- **Transaction Hash Verification**: Every action can be proven with a unique transaction hash

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Freighter Wallet browser extension

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/txlend-dapp.git
cd txlend-dapp
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 How to Use

### Prerequisites
Before using TxLend, make sure you have:
- **Freighter Wallet** installed in your browser
- A **Stellar account** with some XLM for transaction fees
- The **borrower's Stellar wallet address** (you can get this from their Freighter wallet)

### Step 1: Connect Your Wallet
1. **Install Freighter Wallet** (if not already installed):
   - Visit [freighter.app](https://freighter.app)
   - Download and install the browser extension
   - Create a new wallet or import an existing one

2. **Connect to TxLend**:
   - Open the TxLend dApp
   - Click the **"Connect Wallet"** button
   - Select your account in the Freighter popup
   - Approve the connection

### Step 2: Define a Borrower (Lend an Item)
When you want to lend an item to someone:

1. **Enter Item Details**:
   - Type the **item name** (e.g., "My Book: Clean Code", "Drill Machine", "Camera Lens")
   - Be specific and descriptive for easy identification

2. **Enter Borrower Information**:
   - Get the borrower's **Stellar wallet address** from their Freighter wallet
   - Paste the address in the "Borrower Address" field
   - The address should look like: `GABC123...XYZ789`

3. **Record the Transaction**:
   - Click **"Define Borrower"**
   - Review the transaction details in Freighter
   - Approve the transaction (small XLM fee required)
   - Wait for blockchain confirmation
   - You'll see a **Transaction Hash** as proof

### Step 3: Undefine Borrower (Item Returned)
When the borrower returns your item:

1. **Confirm Item Return**:
   - Make sure you physically have the item back
   - Click **"I Took It Back"** button

2. **Complete the Transaction**:
   - Review the transaction in Freighter
   - Approve the transaction (small XLM fee required)
   - The borrower record is permanently removed from blockchain
   - You'll receive a **Transaction Hash** as proof

### Step 4: Verify Transactions
- **Transaction Hashes** are your proof of lending/returning
- You can verify any transaction on [Stellar Explorer](https://stellar.expert)
- Each transaction is **permanent and immutable**

### 💡 Tips for Best Experience
- **Always verify** the borrower's wallet address before lending
- **Keep transaction hashes** as proof of your lending history
- **Use descriptive item names** for easy identification
- **Test with small items** first to get familiar with the process
- **Ensure stable internet** connection during transactions

## 🛠️ Technical Details

### Built With
- **Frontend**: Next.js 14, React, TypeScript
- **Blockchain**: Stellar Soroban smart contracts
- **Wallet**: Freighter Wallet integration
- **Styling**: Tailwind CSS

### Smart Contract Functions
- `define_borrower`: Records who has borrowed an item
- `undefine_borrower`: Removes borrower record when item is returned
- `get_borrower`: Retrieves current borrower information

### Network
- **Testnet**: Stellar Testnet (for development)
- **Mainnet**: Stellar Mainnet (for production)

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── page.tsx          # Main UI component
│   ├── layout.tsx        # App layout and metadata
│   ├── contract.ts       # Smart contract interactions
│   ├── globals.css       # Global styles
│   └── icon.png          # App favicon
├── contract/             # Smart contract source code
└── public/               # Static assets
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Stellar Testnet Deployment
1. Deploy the smart contract to Stellar Testnet
2. Update the contract address in `src/app/contract.ts`
3. Configure RPC URL for Testnet

### Production Deployment
1. Deploy to Stellar Mainnet
2. Update contract address and RPC URL
3. Deploy frontend to Vercel, Netlify, or your preferred platform



## 🙏 Acknowledgments

- Stellar Development Foundation for the amazing blockchain platform
- Soroban team for the smart contract capabilities
- Freighter team for the wallet integration

---

**TxLend** - Making everyday lending transparent and trustworthy through blockchain technology.
