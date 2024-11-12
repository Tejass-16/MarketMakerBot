const { PublicKey, SystemProgram, Transaction } = require('@solana/web3.js');
const connection = new Connection(process.env.RPC_URL);
const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.WALLET_PRIVATE_KEY)));

async function distributeSOL(recipients, amount) {
    for (let recipient of recipients) {
        let transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new PublicKey(recipient),
                lamports: amount * 1e9
            })
        );

        await connection.sendTransaction(transaction, [wallet]);
        console.log(`Distributed ${amount} SOL to ${recipient}`);
    }
}

const recipients = ["WalletPubKey1", "WalletPubKey2"];
const amount = 0.01;
distributeSOL(recipients, amount);
