'use client';

import { useWalletTracker } from '@/hooks/useWalletTracker';
import WalletInput from '@/components/WalletInput';
import BalanceCard from '@/components/BalanceCard';
import TokenList from '@/components/TokenList';
import TransactionList from '@/components/TransactionList';
import LiveStatus from '@/components/LiveStatus';

export default function Home() {
  const {
    walletData,
    connectionStatus,
    trackWallet,
    stopTracking,
    refreshData,
  } = useWalletTracker();

  const isTracking = walletData.address !== '';

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Solana Wallet Tracker
          </h1>
          <p className="text-gray-400">
            Track balances, tokens, and transactions in real-time
          </p>
        </div>

        {/* Wallet Input */}
        <div className="mb-8">
          <WalletInput
            onSubmit={trackWallet}
            onClear={stopTracking}
            isTracking={isTracking}
            isLoading={walletData.isLoading}
          />
        </div>

        {/* Error Message */}
        {walletData.error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300">{walletData.error}</p>
          </div>
        )}

        {/* Loading State */}
        {walletData.isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading wallet data...</p>
          </div>
        )}

        {/* Wallet Data */}
        {isTracking && !walletData.isLoading && !walletData.error && (
          <>
            {/* Live Status */}
            <div className="mb-6">
              <LiveStatus status={connectionStatus} onRefresh={refreshData} />
            </div>

            {/* Balance and Tokens Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <BalanceCard
                balance={walletData.solBalance}
                address={walletData.address}
              />
              <TokenList tokens={walletData.tokens} />
            </div>

            {/* Transactions */}
            <TransactionList transactions={walletData.transactions} />
          </>
        )}

        {/* Empty State */}
        {!isTracking && !walletData.isLoading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl text-white mb-2">Enter a wallet address</h2>
            <p className="text-gray-500">
              Start tracking any Solana wallet by entering its address above
            </p>
            <div className="mt-6 text-gray-600 text-sm">
              <p>Example address to try:</p>
              <code className="block mt-2 text-purple-400 text-xs break-all">
                vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
              </code>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>Connected to Solana Mainnet</p>
        </footer>
      </div>
    </main>
  );
}
