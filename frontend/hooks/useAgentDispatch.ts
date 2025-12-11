"use client";

import { useEffect, useRef } from "react";
import { Room, RoomEvent, RemoteParticipant } from "livekit-client";

// Helper function to safely get participant attributes
function getParticipantAttribute(participant: RemoteParticipant, key: string): string | undefined {
  if (!participant.attributes) return undefined;
  
  // Handle Map-like objects
  if (typeof participant.attributes.get === "function") {
    return participant.attributes.get(key);
  }
  
  // Handle plain objects
  if (typeof participant.attributes === "object" && participant.attributes !== null) {
    return (participant.attributes as Record<string, string>)[key];
  }
  
  return undefined;
}

export function useAgentDispatch(room: Room | null) {
  const dispatchAttempted = useRef(false);

  useEffect(() => {
    if (!room) return;

    const handleConnected = async () => {
      console.log("Room connected, attempting agent dispatch...");
      
      // Only dispatch once per connection
      if (dispatchAttempted.current) {
        console.log("Agent dispatch already attempted, skipping");
        return;
      }
      
      dispatchAttempted.current = true;

      try {
        // Call dispatch API endpoint
        const response = await fetch("/api/dispatch-agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName: room.name,
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          console.log("✅ Agent dispatch API called:", data);
        } else {
          console.error("❌ Agent dispatch failed:", data);
        }
      } catch (error) {
        console.error("Error calling agent dispatch API:", error);
      }
      
      // Log all participants for debugging
      console.log("Current participants:", {
        local: room.localParticipant.identity,
        remote: Array.from(room.remoteParticipants.values()).map(p => ({
          identity: p.identity,
          kind: getParticipantAttribute(p, "kind"),
        })),
      });
    };

    // Check immediately if already connected
    if (room.state === "connected") {
      handleConnected();
    }

    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log("Participant connected:", {
        identity: participant.identity,
        kind: getParticipantAttribute(participant, "kind"),
        sid: participant.sid,
      });
    });

    // Reset on disconnect
    room.on(RoomEvent.Disconnected, () => {
      dispatchAttempted.current = false;
    });

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected);
    };
  }, [room]);
}

