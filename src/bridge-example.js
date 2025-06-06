const ethers = require('ethers');
const axios = require('axios');
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('PRIVATE_KEY exists:', !!process.env.PRIVATE_KEY);
console.log('WALLET_ADDRESS exists:', !!process.env.WALLET_ADDRESS);
console.log('RPC_URL_GNOSIS exists:', !!process.env.RPC_URL_GNOSIS);
console.log('RPC_URL_POLYGON exists:', !!process.env.RPC_URL_POLYGON);
console.log('LIFI_API_URL exists:', !!process.env.LIFI_API_URL);

const API_URL = process.env.LIFI_API_URL || 'https://li.quest/v1';

// ERC20 ABI for approvals
const ERC20_ABI = [
    {
        "name": "approve",
        "inputs": [
            {"internalType": "address", "name": "spender", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "name": "allowance",
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "name": "balanceOf",
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Get a quote for your desired transfer
const getQuote = async (fromChain, toChain, fromToken, toToken, fromAmount, fromAddress) => {
    try {
        const result = await axios.get(`${API_URL}/quote`, {
            params: {
                fromChain,
                toChain,
                fromToken,
                toToken,
                fromAmount,
                fromAddress,
            }
        });
        return result.data;
    } catch (error) {
        console.error('Error getting quote:', error.response?.data || error.message);
        throw error;
    }
}

// Check the status of your transfer
const getStatus = async (bridge, fromChain, toChain, txHash) => {
    try {
        const result = await axios.get(`${API_URL}/status`, {
            params: {
                bridge,
                fromChain,
                toChain,
                txHash,
            }
        });
        return result.data;
    } catch (error) {
        console.error('Error getting status:', error.response?.data || error.message);
        throw error;
    }
}

// Check and set allowance if needed
const checkAndSetAllowance = async (wallet, tokenAddress, approvalAddress, amount) => {
    // Skip for native tokens
    if (tokenAddress === ethers.constants.AddressZero) {
        console.log('Native token - no approval needed');
        return;
    }

    console.log('Checking token allowance...');
    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const allowance = await erc20.allowance(await wallet.getAddress(), approvalAddress);
    
    console.log(`Current allowance: ${ethers.utils.formatUnits(allowance, 6)} USDC`);
    
    if (allowance.lt(amount)) {
        console.log('Insufficient allowance, approving...');
        const approveTx = await erc20.approve(approvalAddress, amount);
        console.log(`Approval tx: ${approveTx.hash}`);
        await approveTx.wait();
        console.log('Approval confirmed!');
    } else {
        console.log('Sufficient allowance already set');
    }
}

const main = async () => {
    try {
        // Configuration
        const fromChain = 'DAI';  // Gnosis Chain
        const fromToken = 'USDC';
        const toChain = 'POL';    // Polygon
        const toToken = 'USDC';
        const fromAmount = '1000000'; // 1 USDC (6 decimals)
        const fromAddress = process.env.WALLET_ADDRESS;

        if (!fromAddress) {
            throw new Error('WALLET_ADDRESS is not set in .env file');
        }

        console.log('=== Li.Fi Bridge Example ===');
        console.log(`Bridging 1 USDC from ${fromChain} to ${toChain}`);
        console.log(`From address: ${fromAddress}`);
        
        // Step 1: Get quote
        console.log('\n1. Getting quote from Li.Fi...');
        const quote = await getQuote(fromChain, toChain, fromToken, toToken, fromAmount, fromAddress);
        
        console.log('Quote received!');
        console.log(`- Tool: ${quote.tool}`);
        console.log(`- Estimated output: ${ethers.utils.formatUnits(quote.estimate.toAmount, 6)} USDC`);
        console.log(`- Gas cost: $${quote.estimate.gasCosts[0]?.amountUSD || 'N/A'}`);
        console.log(`- Execution time: ~${quote.estimate.executionDuration}s`);

        // Setup wallet
        console.log('\n2. Setting up wallet...');
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY is not set in .env file');
        }
        if (!process.env.RPC_URL_GNOSIS) {
            throw new Error('RPC_URL_GNOSIS is not set in .env file');
        }

        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL_GNOSIS);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Check balance
        const tokenAddress = quote.action.fromToken.address;
        if (tokenAddress !== ethers.constants.AddressZero) {
            const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
            const balance = await tokenContract.balanceOf(fromAddress);
            console.log(`Current USDC balance: ${ethers.utils.formatUnits(balance, 6)} USDC`);
        }

        // Step 2: Handle approvals
        console.log('\n3. Handling token approvals...');
        await checkAndSetAllowance(
            wallet, 
            quote.action.fromToken.address, 
            quote.estimate.approvalAddress, 
            fromAmount
        );

        // Step 3: Execute transaction
        console.log('\n4. Executing bridge transaction...');
        console.log('Transaction details:', {
            to: quote.transactionRequest.to,
            value: quote.transactionRequest.value,
            gasLimit: quote.transactionRequest.gasLimit
        });

        // Uncomment the next lines to actually execute (be careful!)
        /*
        const tx = await wallet.sendTransaction(quote.transactionRequest);
        console.log(`Transaction sent: ${tx.hash}`);
        console.log('Waiting for confirmation...');
        await tx.wait();
        console.log('Transaction confirmed on source chain!');

        // Step 4: Monitor status (only for cross-chain)
        if (fromChain !== toChain) {
            console.log('\n5. Monitoring cross-chain status...');
            let result;
            let attempts = 0;
            do {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
                result = await getStatus(quote.tool, fromChain, toChain, tx.hash);
                attempts++;
                console.log(`Status check ${attempts}: ${result.status}`);
            } while (result.status !== 'DONE' && result.status !== 'FAILED' && attempts < 30);
            
            if (result.status === 'DONE') {
                console.log('✅ Bridge completed successfully!');
                console.log(`Destination tx: ${result.receiving?.txHash}`);
            } else {
                console.log('❌ Bridge failed or timed out');
            }
        }
        */

        console.log('\n✅ Example completed! (Transaction not executed - remove comments to execute)');

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
    }
}

main();