# Li.Fi Token Transfer Demo

This project demonstrates how to use Li.Fi to transfer tokens across different blockchain networks using their API.

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
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
# Your wallet's private key (DO NOT SHARE THIS!)
PRIVATE_KEY=your_private_key_here

# RPC URLs for different networks
GOERLI_RPC_URL=https://goerli.infura.io/v3/your_infura_key
MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/your_infura_key

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

### 2. Token Transfers

1. Update the configuration in `src/example.js` with your desired transfer parameters:
   - `fromChain`: Source chain (e.g., 'GOR' for Goerli)
   - `toChain`: Destination chain (e.g., 'MATIC' for Mumbai)
   - `fromToken`: Source token symbol
   - `toToken`: Destination token symbol
   - `fromAmount`: Amount to transfer (in smallest unit, e.g., 1000000 for 1 USDC)
   - `fromAddress`: Your wallet address

2. Run the example:
```bash
node src/example.js
```

## Features

- View all supported chains and their configurations
- Cross-chain token transfers
- Automatic allowance management
- Transaction status monitoring
- Error handling and logging

## Supported Networks

The implementation supports various networks including:
- Goerli (Ethereum testnet)
- Mumbai (Polygon testnet)
- And other networks supported by Li.Fi

To see the complete list of supported networks, run:
```bash
node src/getChains.js
```

## Security Notes

- Never commit your `.env` file or share your private key
- Always test with small amounts first
- Use testnet for development and testing

## License

MIT 