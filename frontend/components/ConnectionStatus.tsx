"use client";

import { ConnectionState } from "livekit-client";

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  error: Error | null;
}

export function ConnectionStatus({ connectionState, error }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return "bg-green-500";
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        return "bg-yellow-500";
      case ConnectionState.Disconnected:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return "Connected";
      case ConnectionState.Connecting:
        return "Connecting...";
      case ConnectionState.Reconnecting:
        return "Reconnecting...";
      case ConnectionState.Disconnected:
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
      <span className="text-sm text-gray-700">{getStatusText()}</span>
      {error && (
        <span className="text-sm text-red-600 ml-2">
          Error: {error.message}
        </span>
      )}
    </div>
  );
}

