'use client';

import { useState, FormEvent } from 'react';

interface WalletInputProps {
  onSubmit: (address: string) => void;
  onClear: () => void;
  isTracking: boolean;
  isLoading: boolean;
}

export default function WalletInput({
  onSubmit,
  onClear,
  isTracking,
  isLoading,
}: WalletInputProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSubmit(address.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Solana wallet address..."
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={isLoading}
        />
        {isTracking ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              setAddress('');
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Stop Tracking
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading || !address.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Loading...' : 'Track Wallet'}
          </button>
        )}
      </div>
    </form>
  );
}
