import { Room, RoomEvent } from "livekit-client";

export interface TokenResponse {
  token: string;
}

/**
 * Fetches an access token from the API
 */
export async function fetchToken(
  roomName: string = "default-room",
  username: string = "user"
): Promise<string> {
  const response = await fetch(
    `/api/token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(username)}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch token");
  }

  const data: TokenResponse = await response.json();
  return data.token;
}

/**
 * Connects to a LiveKit room
 */
export async function connectToRoom(
  url: string,
  token: string
): Promise<Room> {
  const room = new Room();
  
  await room.connect(url, token);
  
  return room;
}

