const axios = require('axios');
require('dotenv').config();

const API_URL = 'https://li.quest/v1';

// Function to get supported chains
const getChains = async (chainTypes = 'EVM') => {
    try {
        const result = await axios.get(`${API_URL}/chains`, {
            params: { chainTypes }
        });
        return result.data;
    } catch (error) {
        console.error('Error fetching chains:', error.response?.data || error.message);
        throw error;
    }
};

// Function to display chain information in a readable format
const displayChainInfo = (chain) => {
    console.log('\n=== Chain Information ===');
    console.log(`Name: ${chain.name}`);
    console.log(`Chain ID: ${chain.id}`);
    console.log(`Key: ${chain.key}`);
    console.log(`Type: ${chain.chainType}`);
    console.log(`Native Token: ${chain.coin}`);
    console.log(`Mainnet: ${chain.mainnet ? 'Yes' : 'No'}`);
    
    if (chain.nativeToken) {
        console.log('\nNative Token Details:');
        console.log(`Symbol: ${chain.nativeToken.symbol}`);
        console.log(`Decimals: ${chain.nativeToken.decimals}`);
        console.log(`Price USD: $${chain.nativeToken.priceUSD}`);
    }

    if (chain.metamask) {
        console.log('\nMetaMask Configuration:');
        console.log(`Chain ID: ${chain.metamask.chainId}`);
        console.log(`Chain Name: ${chain.metamask.chainName}`);
        console.log('RPC URLs:', chain.metamask.rpcUrls);
        console.log('Block Explorer:', chain.metamask.blockExplorerUrls[0]);
    }
    console.log('========================\n');
};

// Main function to run the chain fetching and display
const main = async () => {
    try {
        console.log('Fetching supported chains from Li.Fi...');
        const { chains } = await getChains();

        console.log(`Found ${chains.length} supported chains\n`);

        // Display all chains
        chains.forEach(displayChainInfo);

        // Additional useful information
        const mainnetChains = chains.filter(chain => chain.mainnet);
        const testnetChains = chains.filter(chain => !chain.mainnet);

        console.log('\nSummary:');
        console.log(`Total chains: ${chains.length}`);
        console.log(`Mainnet chains: ${mainnetChains.length}`);
        console.log(`Testnet chains: ${testnetChains.length}`);

        // List all chain keys for easy reference
        console.log('\nAvailable chain keys:');
        chains.forEach(chain => {
            console.log(`${chain.name}: ${chain.key}`);
        });

    } catch (error) {
        console.error('Error in main function:', error.message);
    }
};

// Run the script
main(); 