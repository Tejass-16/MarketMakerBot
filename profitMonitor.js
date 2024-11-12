async function monitorProfit() {
    const minTokenAmount = parseFloat(process.env.MIN_TOKEN_AMOUNT);
    const minSOLBalance = parseFloat(process.env.MIN_SOL_BALANCE);

    const solBalance = await connection.getBalance(wallet.publicKey) / 1e9;
    if (solBalance < minSOLBalance) {
        console.log("Low balance - Skipping trading.");
        return;
    }

    const currentPrice = await fetchTokenPrice();
    const initialPrice = getInitialPrice();
    
    if (shouldAutoSell(currentPrice, initialPrice)) {
        await sellToken();
    }
}

function shouldAutoSell(currentPrice, initialPrice) {
    const profitThreshold = 1.1;
    return (currentPrice / initialPrice) >= profitThreshold;
}
