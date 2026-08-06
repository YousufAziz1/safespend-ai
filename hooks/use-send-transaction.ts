import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { buildTransferTransaction } from '@/lib/solana/build-transaction';
import { saveTransaction, type RiskLevel } from '@/lib/storage/transaction-history';

export function useSendTransaction() {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();

    const [loading, setLoading] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sendTransaction = useCallback(
        async (recipientAddress: string, amountSol: number, riskLevel: RiskLevel = 'safe'): Promise<string | null> => {
            setLoading(true);
            setError(null);
            setSignature(null);

            try {
                if (!publicKey) {
                    throw new Error('Wallet is not connected.');
                }

                if (!signTransaction) {
                    throw new Error('Wallet does not support signing transactions.');
                }

                let recipientPubkey: PublicKey;
                try {
                    recipientPubkey = new PublicKey(recipientAddress);
                } catch {
                    throw new Error('Invalid recipient wallet address format.');
                }

                // 1. Core integration: Build the raw unsigned transaction
                const transaction = await buildTransferTransaction(
                    connection,
                    publicKey,
                    recipientPubkey,
                    amountSol
                );

                // 2. Request explicit user signature via the active wallet provider
                const signedTransaction = await signTransaction(transaction);

                // 3. Serialize and push the raw binary packet into the Solana RPC network
                const rawTransaction = signedTransaction.serialize();
                const txSignature = await connection.sendRawTransaction(rawTransaction, {
                    skipPreflight: false,
                });
                setSignature(txSignature);

                // 4. Poll the network until the confirmation sequence stabilizes
                const latestBlockhash = await connection.getLatestBlockhash('confirmed');
                const confirmation = await connection.confirmTransaction(
                    {
                        blockhash: latestBlockhash.blockhash,
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                        signature: txSignature,
                    },
                    'confirmed'
                );

                if (confirmation.value.err) {
                    throw new Error(`Transaction failed during confirmation: ${confirmation.value.err.toString()}`);
                }

                // Polling for getTransaction to avoid RPC indexing lag
                let txObject = null;
                for (let i = 0; i < 5; i++) {
                    txObject = await connection.getTransaction(txSignature, {
                        maxSupportedTransactionVersion: 0,
                    });

                    if (txObject) {
                        break;
                    }

                    // Wait 2 seconds before retrying
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                if (!txObject) {
                } else {
                    // Append the successful verified transaction mapping to local history storage
                    saveTransaction({
                        signature: txSignature,
                        recipient: recipientAddress,
                        amount: amountSol,
                        riskLevel,
                        status: 'confirmed',
                        timestamp: Date.now(),
                    });
                }

                setLoading(false);
                return txSignature;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'An unknown blockchain error occurred.';
                setError(errorMessage);
                setLoading(false);
                return null;
            }
        },
        [connection, publicKey, signTransaction]
    );

    const simulatePayment = useCallback(
        async (recipientAddress: string, amountSol: number) => {
            try {
                if (!publicKey) throw new Error('Wallet is not connected.');

                let recipientPubkey: PublicKey;
                try {
                    recipientPubkey = new PublicKey(recipientAddress);
                } catch {
                    throw new Error('Invalid recipient wallet address format.');
                }

                const transaction = await buildTransferTransaction(
                    connection,
                    publicKey,
                    recipientPubkey,
                    amountSol
                );

                const { value } = await connection.simulateTransaction(transaction);

                return {
                    success: value.err === null,
                    error: value.err ? (typeof value.err === 'string' ? value.err : JSON.stringify(value.err)) : null,
                    logs: value.logs || [],
                    unitsConsumed: value.unitsConsumed || 0
                };
            } catch (err) {
                return {
                    success: false,
                    error: err instanceof Error ? err.message : 'Unknown fatal simulation crash.',
                    logs: [],
                    unitsConsumed: 0
                };
            }
        },
        [connection, publicKey]
    );

    return {
        loading,
        signature,
        error,
        sendTransaction,
        simulatePayment,
    };
}
