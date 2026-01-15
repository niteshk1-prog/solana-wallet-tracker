import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  ParsedTransactionWithMeta,
  ConfirmedSignatureInfo,
} from '@solana/web3.js';
import { TokenBalance, Transaction } from './types';

// Network configuration - using Helius RPC for mainnet
const NETWORK = 'mainnet-beta';
const HELIUS_API_KEY = 'fba89db8-596f-4e23-9827-7a0189387cb9';

const RPC_ENDPOINTS: Record<string, string> = {
  'devnet': 'https://api.devnet.solana.com',
  'mainnet-beta': `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
};

const WS_ENDPOINTS: Record<string, string> = {
  'devnet': 'wss://api.devnet.solana.com',
  'mainnet-beta': `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
};

const RPC_ENDPOINT = RPC_ENDPOINTS[NETWORK];
const WS_ENDPOINT = WS_ENDPOINTS[NETWORK];

let connection: Connection | null = null;

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_ENDPOINT, {
      wsEndpoint: WS_ENDPOINT,
      commitment: 'confirmed',
    });
  }
  return connection;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function getSolBalance(address: string): Promise<number> {
  const conn = getConnection();
  const pubkey = new PublicKey(address);
  const balance = await conn.getBalance(pubkey);
  return balance / LAMPORTS_PER_SOL;
}

export async function getTokenBalances(address: string): Promise<TokenBalance[]> {
  // Use Helius DAS API to get fungible tokens with metadata
  const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'token-balances',
      method: 'searchAssets',
      params: {
        ownerAddress: address,
        tokenType: 'fungible',
        displayOptions: {
          showNativeBalance: false,
        },
      },
    }),
  });

  const data = await response.json();
  const tokens: TokenBalance[] = [];

  if (data.result?.items) {
    for (const item of data.result.items) {
      const balance = item.token_info?.balance || 0;
      const decimals = item.token_info?.decimals || 0;
      const uiBalance = balance / Math.pow(10, decimals);

      if (uiBalance > 0) {
        tokens.push({
          mint: item.id,
          symbol: item.token_info?.symbol || item.content?.metadata?.symbol || item.id.slice(0, 4) + '...',
          name: item.content?.metadata?.name || item.token_info?.symbol || 'Unknown Token',
          balance: balance,
          decimals: decimals,
          uiBalance: uiBalance.toLocaleString(undefined, { maximumFractionDigits: decimals }),
        });
      }
    }
  }

  return tokens;
}

export async function getTransactionHistory(
  address: string,
  limit: number = 10
): Promise<Transaction[]> {
  const conn = getConnection();
  const pubkey = new PublicKey(address);

  const signatures: ConfirmedSignatureInfo[] = await conn.getSignaturesForAddress(
    pubkey,
    { limit }
  );

  const transactions: Transaction[] = [];

  for (const sig of signatures) {
    try {
      const tx: ParsedTransactionWithMeta | null = await conn.getParsedTransaction(
        sig.signature,
        { maxSupportedTransactionVersion: 0 }
      );

      if (tx) {
        const preBalances = tx.meta?.preBalances || [];
        const postBalances = tx.meta?.postBalances || [];
        const accountKeys = tx.transaction.message.accountKeys;

        let type: 'send' | 'receive' | 'unknown' = 'unknown';
        let amount: number | null = null;

        const walletIndex = accountKeys.findIndex(
          (key) => key.pubkey.toBase58() === address
        );

        if (walletIndex !== -1 && preBalances[walletIndex] !== undefined) {
          const balanceChange =
            (postBalances[walletIndex] - preBalances[walletIndex]) / LAMPORTS_PER_SOL;

          if (balanceChange > 0) {
            type = 'receive';
            amount = balanceChange;
          } else if (balanceChange < 0) {
            type = 'send';
            amount = Math.abs(balanceChange);
          }
        }

        transactions.push({
          signature: sig.signature,
          timestamp: sig.blockTime,
          slot: sig.slot,
          type,
          amount,
          status: sig.err ? 'failed' : 'success',
          fee: (tx.meta?.fee || 0) / LAMPORTS_PER_SOL,
        });
      }
    } catch (err) {
      console.error('Error fetching transaction:', err);
    }
  }

  return transactions;
}

export function subscribeToAccount(
  address: string,
  onUpdate: () => void
): number {
  const conn = getConnection();
  const pubkey = new PublicKey(address);

  const subscriptionId = conn.onAccountChange(pubkey, () => {
    onUpdate();
  });

  return subscriptionId;
}

export async function unsubscribeFromAccount(subscriptionId: number): Promise<void> {
  const conn = getConnection();
  await conn.removeAccountChangeListener(subscriptionId);
}
