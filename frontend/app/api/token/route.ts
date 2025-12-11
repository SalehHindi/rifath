import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Server misconfigured. Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET" },
        { status: 500 }
      );
    }

    // Get room name and participant name from query params
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get("room") || "default-room";
    const participantName = searchParams.get("username") || "user";

    // Create access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    // Grant permissions
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Generate token
    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

