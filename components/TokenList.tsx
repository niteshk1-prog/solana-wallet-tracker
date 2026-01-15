'use client';

import { TokenBalance } from '@/lib/types';

interface TokenListProps {
  tokens: TokenBalance[];
}

export default function TokenList({ tokens }: TokenListProps) {
  if (tokens.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-white text-lg font-semibold mb-4">SPL Tokens</h2>
        <p className="text-gray-500 text-center py-8">No tokens found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-white text-lg font-semibold mb-4">
        SPL Tokens ({tokens.length})
      </h2>
      <div className="space-y-3">
        {tokens.map((token) => (
          <div
            key={token.mint}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {token.symbol.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{token.name}</p>
                <p className="text-gray-400 text-sm">{token.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{token.uiBalance}</p>
              <a
                href={`https://explorer.solana.com/address/${token.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-xs transition-colors"
              >
                View Token
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
