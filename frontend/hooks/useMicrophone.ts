"use client";

import { useEffect, useState, useCallback } from "react";
import { Room, RoomEvent, Track, TrackPublication } from "livekit-client";

export interface UseMicrophoneReturn {
  isEnabled: boolean;
  isMuted: boolean;
  hasPermission: boolean | null;
  error: Error | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

export function useMicrophone(room: Room | null): UseMicrophoneReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Check microphone permission status
  const checkPermission = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setHasPermission(result.state === "granted");
        result.onchange = () => {
          setHasPermission(result.state === "granted");
        };
      } else {
        // Fallback: try to access microphone
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasPermission(true);
          stream.getTracks().forEach((track) => track.stop());
        } catch {
          setHasPermission(false);
        }
      }
    } catch (err) {
      console.error("Error checking microphone permission:", err);
      setHasPermission(null);
    }
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      setError(null);
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Microphone permission denied");
      setError(error);
      setHasPermission(false);
      return false;
    }
  }, []);

  // Enable microphone
  const enable = useCallback(async () => {
    if (!room) {
      setError(new Error("Room not connected"));
      return;
    }

    try {
      setError(null);

      // Check/request permission first
      if (hasPermission === false) {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error("Microphone permission denied");
        }
      }

      // Enable microphone track
      await room.localParticipant.setMicrophoneEnabled(true);

      // Wait a bit for track to be published
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify track is enabled
      const micTrack = room.localParticipant.audioTrackPublications.values().next().value;
      if (micTrack && micTrack.isMuted) {
        await room.localParticipant.setMicrophoneEnabled(false);
        await room.localParticipant.setMicrophoneEnabled(true);
      }

      setIsEnabled(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to enable microphone");
      setError(error);
      setIsEnabled(false);
      throw error;
    }
  }, [room, hasPermission, requestPermission]);

  // Disable microphone
  const disable = useCallback(async () => {
    if (!room) {
      return;
    }

    try {
      setError(null);
      await room.localParticipant.setMicrophoneEnabled(false);
      setIsEnabled(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to disable microphone");
      setError(error);
      console.error("Failed to disable microphone:", err);
    }
  }, [room]);

  // Monitor microphone state
  useEffect(() => {
    if (!room) {
      setIsEnabled(false);
      setIsMuted(false);
      return;
    }

    const updateMicrophoneState = () => {
      const micEnabled = room.localParticipant.isMicrophoneEnabled;
      setIsEnabled(micEnabled);

      // Check if track is muted
      const micTrack = Array.from(room.localParticipant.audioTrackPublications.values()).find(
        (pub) => pub.kind === "audio" && pub.source === "microphone"
      );
      setIsMuted(micTrack?.isMuted ?? false);
    };

    // Initial state
    updateMicrophoneState();

    // Listen for track events
    const handleTrackPublished = (publication: TrackPublication) => {
      if (publication.kind === "audio" && publication.source === "microphone") {
        updateMicrophoneState();
      }
    };

    const handleTrackUnpublished = (publication: TrackPublication) => {
      if (publication.kind === "audio" && publication.source === "microphone") {
        updateMicrophoneState();
      }
    };

    const handleTrackMuted = (publication: TrackPublication) => {
      if (publication.kind === "audio" && publication.source === "microphone") {
        updateMicrophoneState();
      }
    };

    const handleTrackUnmuted = (publication: TrackPublication) => {
      if (publication.kind === "audio" && publication.source === "microphone") {
        updateMicrophoneState();
      }
    };

    room.on(RoomEvent.TrackPublished, handleTrackPublished);
    room.on(RoomEvent.TrackUnpublished, handleTrackUnpublished);
    room.on(RoomEvent.TrackMuted, handleTrackMuted);
    room.on(RoomEvent.TrackUnmuted, handleTrackUnmuted);
    room.on(RoomEvent.LocalTrackPublished, handleTrackPublished);
    room.on(RoomEvent.LocalTrackUnpublished, handleTrackUnpublished);

    return () => {
      room.off(RoomEvent.TrackPublished, handleTrackPublished);
      room.off(RoomEvent.TrackUnpublished, handleTrackUnpublished);
      room.off(RoomEvent.TrackMuted, handleTrackMuted);
      room.off(RoomEvent.TrackUnmuted, handleTrackUnmuted);
      room.off(RoomEvent.LocalTrackPublished, handleTrackPublished);
      room.off(RoomEvent.LocalTrackUnpublished, handleTrackUnpublished);
    };
  }, [room]);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    isEnabled,
    isMuted,
    hasPermission,
    error,
    enable,
    disable,
    requestPermission,
  };
}

