"use client";

import { useState, useEffect } from "react";
import { ConnectionState } from "livekit-client";
import { useLiveKitRoom } from "@/hooks/useLiveKitRoom";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { PushToTalkButton } from "@/components/VoiceAgent/PushToTalkButton";
import { ModeRenderer } from "@/components/ModeRenderer";
import { useMode } from "@/contexts/ModeContext";
import { useRPC } from "@/hooks/useRPC";
import { useAgentAudio } from "@/hooks/useAgentAudio";
import { useAgentDispatch } from "@/hooks/useAgentDispatch";

export default function Home() {
  const { room, connectionState, isConnected, error, connect, disconnect } =
    useLiveKitRoom();
  const [roomName, setRoomName] = useState("default-room");
  const [username, setUsername] = useState("user");
  const { currentMode } = useMode();

  // Register RPC methods when room is connected
  useRPC(room);
  
  // Subscribe to agent audio tracks
  useAgentAudio(room);
  
  // Debug agent dispatch
  useAgentDispatch(room);

  const handleConnect = async () => {
    await connect(roomName, username);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              LiveKit Voice Agent
            </h1>
            <ConnectionStatus connectionState={connectionState} error={error} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Left Sidebar - Connection Controls */}
          <div className="lg:w-80 flex-shrink-0 space-y-6">
            {/* Connection Controls */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Connection</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={isConnected}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={isConnected}
                  />
                </div>
                <div>
                  {!isConnected ? (
                    <button
                      onClick={handleConnect}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      disabled={connectionState === ConnectionState.Connecting}
                    >
                      {connectionState === ConnectionState.Connecting
                        ? "Connecting..."
                        : "Connect"}
                    </button>
                  ) : (
                    <button
                      onClick={handleDisconnect}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Push-to-Talk Button */}
            {isConnected && room && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-center">
                  Voice Control
                </h2>
                <div className="flex justify-center">
                  <PushToTalkButton
                    room={room}
                    isConnected={isConnected}
                    onListeningChange={(listening) => {
                      console.log("Listening state:", listening);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Room Info */}
            {isConnected && room && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-sm font-semibold mb-2">Room Info</h2>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>
                    <span className="font-medium">Room:</span> {room.name}
                  </p>
                  <p>
                    <span className="font-medium">User:</span>{" "}
                    {room.localParticipant.identity}
                  </p>
                  <p>
                    <span className="font-medium">Participants:</span>{" "}
                    {room.remoteParticipants.size + 1}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area - Component Rendering */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Content Area</h2>
                {/* Mode indicator for debugging */}
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Mode: {currentMode}
                </span>
              </div>
              <div className="w-full">
                <ModeRenderer mode={currentMode} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
