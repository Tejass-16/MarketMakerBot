const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;

let transactions = [];
let botStatus = 'Initializing';
let currentPrice = 'N/A';

async function fetchTokenPrice() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        return response.data.solana.usd;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log('Rate limit exceeded. Retrying after delay.');
            botStatus = 'Rate-limited. Retrying...';
            await new Promise(resolve => setTimeout(resolve, 35000)); // Wait 35 seconds before retrying
            return fetchTokenPrice(); // Retry fetching price
        } else {
            console.error('Error fetching token price:', error.message);
            botStatus = 'Error fetching price';
            throw error;
        }
    }
}

async function marketMaker() {
    try {
        currentPrice = await fetchTokenPrice();
        const transaction = {
            id: `txn_${Date.now()}`,
            type: 'buy',
            amount: 0.01,
            price: currentPrice,
            timestamp: new Date().toISOString(),
        };

        // Log the transaction to verify if it's being created
        console.log('New Transaction:', transaction);

        transactions.push(transaction); // Store the transaction

        botStatus = 'Running';
        console.log(`Transaction: Buying 0.01 SOL at price ${currentPrice}`);
    } catch (error) {
        console.log('Skipping market-making due to error.');
    }
}

setInterval(marketMaker, 6000); // Run market maker every 60 seconds

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Get status and current price
app.get('/status', (req, res) => {
    res.json({ botStatus, currentPrice });
});

// Get transactions (last 10)
app.get('/transactions', (req, res) => {
    console.log('Returning transactions:', transactions);
    res.json(transactions.slice(-10)); // Send the last 10 transactions
});

app.listen(port, () => {
    console.log(`Market maker bot server is running at http://localhost:${port}`);
});
