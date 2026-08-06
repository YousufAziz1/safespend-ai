import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

/**
 * Builds an unsigned Solana transfer transaction.
 *
 * @param connection - The active Solana RPC connection logic context.
 * @param sender - The PublicKey of the sender (fee payer).
 * @param recipient - The PublicKey of the remote recipient mapping.
 * @param amountSol - The human-readable amount of SOL to transfer.
 * @returns A Promise resolving to an unsigned Transaction object ready to be signed/sent.
 */
export async function buildTransferTransaction(
    connection: Connection,
    sender: PublicKey,
    recipient: PublicKey,
    amountSol: number
): Promise<Transaction> {
    try {
        if (amountSol <= 0) {
            throw new Error('Transfer amount must be strictly greater than 0 SOL.');
        }

        // 1. Convert SOL to absolute Lamports safely avoiding floating precision errors
        const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

        // 2. Formulate the core baseline transfer payload via SystemProgram
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: sender,
            toPubkey: recipient,
            lamports,
        });

        const transaction = new Transaction().add(transferInstruction);

        // 3. Attach authoritative fee payer parameters
        transaction.feePayer = sender;

        // 4. Actively fetch the live network blockhash to sequence the transaction on-chain
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;

        // 5. Expose purely unsigned output structure
        return transaction;
    } catch (error) {
        console.error('[SafeSpend] Critical error building transaction payload:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to securely build the Solana transaction.';
        throw new Error(errorMessage);
    }
}
