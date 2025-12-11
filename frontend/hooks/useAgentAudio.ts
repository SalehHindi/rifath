"use client";

import { useEffect, useRef } from "react";
import { Room, RoomEvent, RemoteParticipant, Track, TrackPublication } from "livekit-client";

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

export function useAgentAudio(room: Room | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!room) return;

    // Create audio element for agent audio
    const audioElement = document.createElement("audio");
    audioElement.autoplay = true;
    audioElement.playsInline = true;
    document.body.appendChild(audioElement);
    audioRef.current = audioElement;

    const handleTrackSubscribed = (
      track: Track,
      publication: TrackPublication,
      participant: RemoteParticipant
    ) => {
      const kindAttr = getParticipantAttribute(participant, "kind");
      console.log("Track subscribed:", {
        participant: participant.identity,
        kind: kindAttr,
        trackKind: track.kind,
        trackSid: track.sid,
      });
      
      // Check if this is an agent participant
      const isAgent = kindAttr === "agent" || participant.kind === "agent";
      
      if (isAgent && track.kind === "audio") {
        console.log("✅ Agent audio track subscribed, attaching to audio element");
        track.attach(audioElement);
        
        // Also try to play it
        audioElement.play().catch((err) => {
          console.error("Error playing audio:", err);
        });
      }
    };

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      const kindAttr = getParticipantAttribute(participant, "kind");
      
      // Safely get all attributes for logging
      let allAttributes: Record<string, string> = {};
      if (participant.attributes) {
        if (typeof participant.attributes.entries === "function") {
          // It's a Map
          allAttributes = Object.fromEntries(participant.attributes);
        } else if (typeof participant.attributes === "object") {
          // It's a plain object
          allAttributes = participant.attributes as Record<string, string>;
        }
      }
      
      console.log("Participant connected:", {
        identity: participant.identity,
        kind: kindAttr,
        sid: participant.sid,
        allAttributes,
      });
      
      // Check if this is an agent (check both kind attribute and participant kind)
      const isAgent = kindAttr === "agent" || participant.kind === "agent";
      
      console.log("Is agent?", isAgent, "kind attr:", kindAttr, "participant.kind:", participant.kind);
      
      if (isAgent) {
        console.log("✅ Agent participant detected:", participant.identity);
        
        // Subscribe to existing tracks
        participant.audioTrackPublications.forEach((publication) => {
          console.log("Agent audio publication:", {
            trackSid: publication.trackSid,
            kind: publication.kind,
            isSubscribed: publication.isSubscribed,
            hasTrack: !!publication.track,
          });
          
          if (publication.track) {
            console.log("✅ Found existing agent audio track, attaching");
            publication.track.attach(audioElement);
          } else if (!publication.isSubscribed) {
            console.log("Subscribing to agent audio track...");
            publication.setSubscribed(true);
          }
        });
      }
    };

    const handleTrackPublished = (
      publication: TrackPublication,
      participant: RemoteParticipant
    ) => {
      // Check if this is an agent participant
      const kindAttr = getParticipantAttribute(participant, "kind");
      const isAgent = kindAttr === "agent" || participant.kind === "agent";
      
      if (isAgent && publication.kind === "audio") {
        console.log("Agent audio track published, subscribing...");
        // The track will be automatically subscribed due to autoSubscribe: true
        // But we can also manually subscribe if needed
        if (!publication.isSubscribed) {
          publication.setSubscribed(true);
        }
      }
    };

    // Listen for track subscriptions and participant events
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.TrackPublished, handleTrackPublished);

    // Check for existing agent participants
    console.log("Checking existing participants:", room.remoteParticipants.size);
    room.remoteParticipants.forEach((participant) => {
      const kindAttr = getParticipantAttribute(participant, "kind");
      const isAgent = kindAttr === "agent" || participant.kind === "agent";
      
      console.log("Existing participant:", {
        identity: participant.identity,
        kindAttr,
        participantKind: participant.kind,
        isAgent,
      });
      
      if (isAgent) {
        console.log("✅ Found existing agent participant");
        participant.audioTrackPublications.forEach((publication) => {
          console.log("Agent audio publication:", {
            trackSid: publication.trackSid,
            isSubscribed: publication.isSubscribed,
            hasTrack: !!publication.track,
          });
          
          if (publication.track) {
            console.log("✅ Attaching existing agent audio track");
            publication.track.attach(audioElement);
          } else if (!publication.isSubscribed) {
            console.log("Subscribing to agent audio track...");
            publication.setSubscribed(true);
          }
        });
      }
    });

    return () => {
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.TrackPublished, handleTrackPublished);
      
      // Cleanup audio element
      if (audioRef.current) {
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, [room]);
}

