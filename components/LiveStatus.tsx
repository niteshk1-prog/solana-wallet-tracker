'use client';

import { ConnectionStatus } from '@/lib/types';

interface LiveStatusProps {
  status: ConnectionStatus;
  onRefresh: () => void;
}

export default function LiveStatus({ status, onRefresh }: LiveStatusProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-gray-400 text-sm">
          {status.isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {status.isSubscribed && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-gray-400 text-sm">Live Updates</span>
        </div>
      )}

      {status.lastUpdate && (
        <span className="text-gray-500 text-xs">
          Last update: {status.lastUpdate.toLocaleTimeString()}
        </span>
      )}

      <button
        onClick={onRefresh}
        className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}
