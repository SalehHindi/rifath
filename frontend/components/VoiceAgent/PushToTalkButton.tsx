"use client";

import { useState, useRef, useEffect } from "react";
import { Room } from "livekit-client";
import { useMicrophone } from "@/hooks/useMicrophone";

interface PushToTalkButtonProps {
  room: Room | null;
  isConnected: boolean;
  onListeningChange?: (isListening: boolean) => void;
}

export function PushToTalkButton({
  room,
  isConnected,
  onListeningChange,
}: PushToTalkButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Use microphone hook for better state management
  const {
    isEnabled: isListening,
    isMuted,
    hasPermission,
    error: micError,
    enable,
    disable,
    requestPermission,
  } = useMicrophone(room);

  // Handle mouse down - start listening
  const handleMouseDown = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isConnected || !room) return;

    setIsPressed(true);
    try {
      await enable();
      onListeningChange?.(true);
    } catch (error) {
      console.error("Failed to enable microphone:", error);
      setIsPressed(false);
    }
  };

  // Handle mouse up - stop listening
  const handleMouseUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await disable();
      onListeningChange?.(false);
    } catch (error) {
      console.error("Failed to disable microphone:", error);
    }
    setIsPressed(false);
  };

  // Handle mouse leave - stop listening if button was pressed
  const handleMouseLeave = async () => {
    if (isPressed) {
      try {
        await disable();
        onListeningChange?.(false);
      } catch (error) {
        console.error("Failed to disable microphone:", error);
      }
      setIsPressed(false);
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = async (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isConnected || !room) return;

    setIsPressed(true);
    try {
      await enable();
      onListeningChange?.(true);
    } catch (error) {
      console.error("Failed to enable microphone:", error);
      setIsPressed(false);
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    e.preventDefault();
    try {
      await disable();
      onListeningChange?.(false);
    } catch (error) {
      console.error("Failed to disable microphone:", error);
    }
    setIsPressed(false);
  };

  const handleTouchCancel = async () => {
    try {
      await disable();
      onListeningChange?.(false);
    } catch (error) {
      console.error("Failed to disable microphone:", error);
    }
    setIsPressed(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening && room) {
        disable().catch(console.error);
      }
    };
  }, [isListening, room, disable]);

  // Determine button state
  const getButtonState = () => {
    if (!isConnected) return "disabled";
    if (hasPermission === false) return "no-permission";
    if (micError) return "error";
    if (isListening) return "listening";
    if (isMuted && isListening) return "muted";
    return "idle";
  };

  const buttonState = getButtonState();

  // Button styles based on state
  const getButtonClasses = () => {
    const baseClasses =
      "relative w-24 h-24 rounded-full font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    switch (buttonState) {
      case "listening":
        return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-500/50 scale-105`;
      case "muted":
        return `${baseClasses} bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 shadow-lg shadow-orange-500/50 scale-105`;
      case "error":
        return `${baseClasses} bg-red-800 hover:bg-red-900 focus:ring-red-500 shadow-md`;
      case "no-permission":
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 shadow-md`;
      case "disabled":
        return `${baseClasses} bg-gray-400 cursor-not-allowed`;
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-md`;
    }
  };

  // Pulse animation for listening state
  const getPulseClasses = () => {
    if (buttonState === "listening") {
      return "absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75";
    }
    return "";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        ref={buttonRef}
        className={getButtonClasses()}
        disabled={!isConnected}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {/* Pulse animation ring */}
        {buttonState === "listening" && (
          <span className={getPulseClasses()} aria-hidden="true" />
        )}

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center h-full">
          {buttonState === "listening" ? (
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </span>
      </button>

      {/* Status text */}
      <div className="text-sm font-medium text-gray-700 text-center">
        {buttonState === "disabled" && "Not Connected"}
        {buttonState === "no-permission" && (
          <button
            onClick={requestPermission}
            className="text-yellow-600 hover:text-yellow-700 underline"
          >
            Grant Microphone Permission
          </button>
        )}
        {buttonState === "error" && (
          <span className="text-red-600">
            {micError?.message || "Microphone Error"}
          </span>
        )}
        {buttonState === "muted" && "Muted"}
        {buttonState === "idle" && "Hold to Talk"}
        {buttonState === "listening" && "Listening..."}
      </div>
    </div>
  );
}

