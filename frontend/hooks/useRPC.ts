"use client";

import { useEffect, useRef } from "react";
import { Room } from "livekit-client";
import { useMode } from "@/contexts/ModeContext";
import { UIMode } from "@/components/ModeRenderer";

export function useRPC(room: Room | null) {
  const { setMode, currentMode } = useMode();
  const currentModeRef = useRef(currentMode);
  
  // Keep ref in sync with current mode
  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);

  useEffect(() => {
    if (!room) return;

    // Register set_mode RPC method
    const setModeHandler = async (request: any) => {
      try {
        const { mode } = request.payload as { mode: string };
        
        // Validate mode
        const validModes: UIMode[] = ["blank", "quiz", "table", "placeholder"];
        if (!validModes.includes(mode as UIMode)) {
          return {
            success: false,
            error: `Invalid mode: ${mode}. Valid modes are: ${validModes.join(", ")}`,
          };
        }

        // Update mode
        setMode(mode as UIMode);
        
        return { success: true, mode };
      } catch (error) {
        console.error("Error in set_mode RPC:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    };

    // Register get_mode RPC method
    const getModeHandler = async () => {
      try {
        return {
          success: true,
          mode: currentModeRef.current,
        };
      } catch (error) {
        console.error("Error in get_mode RPC:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    };

    // Register RPC methods
    room.registerRpcMethod("set_mode", setModeHandler);
    room.registerRpcMethod("get_mode", getModeHandler);

    console.log("RPC methods registered: set_mode, get_mode");

    // Cleanup
    return () => {
      // Note: LiveKit doesn't have unregisterRpcMethod, but methods are cleaned up when room disconnects
    };
  }, [room, setMode]);
}

