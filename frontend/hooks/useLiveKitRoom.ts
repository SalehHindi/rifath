"use client";

import { useEffect, useState, useCallback } from "react";
import { Room, RoomEvent, ConnectionState, RoomOptions } from "livekit-client";
import { fetchToken } from "@/lib/livekit";

export interface UseLiveKitRoomReturn {
  room: Room | null;
  connectionState: ConnectionState;
  isConnected: boolean;
  error: Error | null;
  connect: (roomName?: string, username?: string) => Promise<void>;
  disconnect: () => void;
}

export function useLiveKitRoom(): UseLiveKitRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(
    async (roomName: string = "default-room", username: string = "user") => {
      try {
        setError(null);

        // Get LiveKit URL from environment
        const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
        if (!livekitUrl) {
          throw new Error("NEXT_PUBLIC_LIVEKIT_URL is not set");
        }

        // Fetch token
        const token = await fetchToken(roomName, username);

        // Create new room with auto-subscribe enabled
        const newRoom = new Room({
          autoSubscribe: true, // Automatically subscribe to remote tracks
        });

        // Set up event listeners
        newRoom.on(RoomEvent.Connected, () => {
          console.log("Connected to room");
          setConnectionState(ConnectionState.Connected);
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          console.log("Disconnected from room");
          setConnectionState(ConnectionState.Disconnected);
        });

        newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
          console.log("Connection state changed:", state);
          setConnectionState(state);
        });

        newRoom.on(RoomEvent.Reconnecting, () => {
          console.log("Reconnecting...");
          setConnectionState(ConnectionState.Reconnecting);
        });

        newRoom.on(RoomEvent.Reconnected, () => {
          console.log("Reconnected");
          setConnectionState(ConnectionState.Connected);
        });

        // Connect to room
        await newRoom.connect(livekitUrl, token);
        setRoom(newRoom);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        console.error("Failed to connect to room:", error);
        setError(error);
        setConnectionState(ConnectionState.Disconnected);
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setConnectionState(ConnectionState.Disconnected);
    }
  }, [room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  const isConnected = connectionState === ConnectionState.Connected;

  return {
    room,
    connectionState,
    isConnected,
    error,
    connect,
    disconnect,
  };
}

