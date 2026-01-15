export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  uiBalance: string;
}

export interface Transaction {
  signature: string;
  timestamp: number | null;
  slot: number;
  type: 'send' | 'receive' | 'unknown';
  amount: number | null;
  status: 'success' | 'failed';
  fee: number;
}

export interface WalletData {
  address: string;
  solBalance: number;
  tokens: TokenBalance[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isSubscribed: boolean;
  lastUpdate: Date | null;
}
