'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSolBalance,
  getTokenBalances,
  getTransactionHistory,
  subscribeToAccount,
  unsubscribeFromAccount,
  isValidSolanaAddress,
} from '@/lib/solana';
import { WalletData, ConnectionStatus, TokenBalance, Transaction } from '@/lib/types';

const initialWalletData: WalletData = {
  address: '',
  solBalance: 0,
  tokens: [],
  transactions: [],
  isLoading: false,
  error: null,
};

const initialConnectionStatus: ConnectionStatus = {
  isConnected: false,
  isSubscribed: false,
  lastUpdate: null,
};

export function useWalletTracker() {
  const [walletData, setWalletData] = useState<WalletData>(initialWalletData);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    initialConnectionStatus
  );
  const subscriptionRef = useRef<number | null>(null);

  const fetchWalletData = useCallback(async (address: string) => {
    if (!isValidSolanaAddress(address)) {
      setWalletData((prev) => ({
        ...prev,
        error: 'Invalid Solana address',
        isLoading: false,
      }));
      return;
    }

    setWalletData((prev) => ({
      ...prev,
      address,
      isLoading: true,
      error: null,
    }));

    try {
      const [solBalance, tokens, transactions] = await Promise.all([
        getSolBalance(address),
        getTokenBalances(address),
        getTransactionHistory(address, 10),
      ]);

      setWalletData({
        address,
        solBalance,
        tokens,
        transactions,
        isLoading: false,
        error: null,
      });

      setConnectionStatus((prev) => ({
        ...prev,
        isConnected: true,
        lastUpdate: new Date(),
      }));
    } catch (err) {
      setWalletData((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch wallet data',
      }));
      setConnectionStatus((prev) => ({
        ...prev,
        isConnected: false,
      }));
    }
  }, []);

  const subscribeToWallet = useCallback(
    (address: string) => {
      if (!isValidSolanaAddress(address)) return;

      if (subscriptionRef.current !== null) {
        unsubscribeFromAccount(subscriptionRef.current);
      }

      try {
        const subId = subscribeToAccount(address, () => {
          fetchWalletData(address);
        });

        subscriptionRef.current = subId;
        setConnectionStatus((prev) => ({
          ...prev,
          isSubscribed: true,
        }));
      } catch (err) {
        console.error('Failed to subscribe:', err);
        setConnectionStatus((prev) => ({
          ...prev,
          isSubscribed: false,
        }));
      }
    },
    [fetchWalletData]
  );

  const trackWallet = useCallback(
    async (address: string) => {
      await fetchWalletData(address);
      subscribeToWallet(address);
    },
    [fetchWalletData, subscribeToWallet]
  );

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current !== null) {
      unsubscribeFromAccount(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    setWalletData(initialWalletData);
    setConnectionStatus(initialConnectionStatus);
  }, []);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current !== null) {
        unsubscribeFromAccount(subscriptionRef.current);
      }
    };
  }, []);

  return {
    walletData,
    connectionStatus,
    trackWallet,
    stopTracking,
    refreshData: () => fetchWalletData(walletData.address),
  };
}
