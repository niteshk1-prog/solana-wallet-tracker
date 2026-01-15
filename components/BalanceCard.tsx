'use client';

interface BalanceCardProps {
  balance: number;
  address: string;
}

export default function BalanceCard({ balance, address }: BalanceCardProps) {
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-300 text-sm font-medium">SOL Balance</h2>
        <span className="text-gray-400 text-xs bg-gray-800 px-2 py-1 rounded">
          {shortenAddress(address)}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-white">
          {balance.toFixed(4)}
        </span>
        <span className="text-xl text-gray-400">SOL</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <a
          href={`https://explorer.solana.com/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
        >
          View on Solana Explorer →
        </a>
      </div>
    </div>
  );
}
