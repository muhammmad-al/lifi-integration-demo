# Li.Fi Token Bridge Demo

This project demonstrates how to use Li.Fi to transfer tokens across different blockchain networks using their API. It includes functionality to view supported chains and execute cross-chain token transfers.

## Prerequisites

- Node.js (v14 or higher)
- npm
- A wallet with some testnet tokens
- Infura API key (or other RPC provider)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd lifi-integration-demo
```

2. Install dependencies:
```bash
npm install ethers@5.7.2 axios dotenv
```

3. Create a `.env` file in the root directory with the following variables:
```
# Your wallet's private key (DO NOT SHARE THIS!)
PRIVATE_KEY=your_private_key_here

# Your wallet address
WALLET_ADDRESS=your_wallet_address_here

# RPC URLs for the networks
RPC_URL_GNOSIS=https://rpc.gnosischain.com
RPC_URL_POLYGON=https://polygon-rpc.com

# Li.Fi API URL
LIFI_API_URL=https://li.quest/v1
```

## Usage

### 1. View Supported Chains

To see all supported chains and their configurations:

```bash
node src/getChains.js
```

This will display:
- List of all supported chains
- Chain details including native tokens
- MetaMask configuration for each chain
- Summary of mainnet and testnet chains
- Available chain keys for use in transfers

### 2. Token Bridge Example

The bridge example demonstrates how to transfer tokens between chains:

```bash
node src/bridge-example.js
```

The example is configured to transfer 1 USDC from Gnosis Chain to Polygon. To modify the transfer:

1. Open `src/bridge-example.js`
2. Update the configuration in the `main()` function:
```javascript
const fromChain = 'DAI';  // Gnosis Chain
const fromToken = 'USDC';
const toChain = 'POL';    // Polygon
const toToken = 'USDC';
const fromAmount = '1000000'; // 1 USDC (6 decimals)
```

3. To execute the transfer, uncomment the transaction section in the code (around line 150-170).

## Features

- View all supported chains and their configurations
- Cross-chain token transfers
- Automatic allowance management
- Transaction status monitoring
- Error handling and logging
- Environment variable validation
- Balance checking before transfers

## Supported Networks

The implementation supports various networks including:
- Gnosis Chain (DAI)
- Polygon (POL)
- And other networks supported by Li.Fi

To see the complete list of supported networks, run:
```bash
node src/getChains.js
```

## Security Notes

- Never commit your `.env` file or share your private key
- Always test with small amounts first
- Use testnet for development and testing
- The transaction execution is commented out by default for safety
- Always verify transaction details before executing

## Project Structure

```
lifi-integration-demo/
├── src/
│   ├── getChains.js      # View supported chains
│   └── bridge-example.js # Token bridge implementation
├── .env                  # Environment variables (not tracked by git)
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## License

MIT 