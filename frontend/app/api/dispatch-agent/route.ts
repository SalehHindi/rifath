import { NextRequest, NextResponse } from "next/server";
import { AgentDispatchClient } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.replace("wss://", "https://").replace("ws://", "http://");

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { error: "Server misconfigured. Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or LIVEKIT_URL" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { roomName } = body;

    if (!roomName) {
      return NextResponse.json(
        { error: "Missing roomName" },
        { status: 400 }
      );
    }

    // Create AgentDispatchClient to dispatch the agent
    // The agent name must match the agent_name in agent/main.py
    const agentDispatchClient = new AgentDispatchClient(livekitUrl, apiKey, apiSecret);
    
    console.log(`Creating agent dispatch for room: ${roomName}, agent: voice-assistant`);
    
    // Create the dispatch - this will trigger the agent worker to connect
    const dispatch = await agentDispatchClient.createDispatch(
      roomName,
      "voice-assistant", // Must match agent_name in agent/main.py
      {
        metadata: JSON.stringify({ kind: "agent" }),
      }
    );

    console.log("✅ Agent dispatch created:", {
      dispatchId: dispatch.dispatchId,
      room: dispatch.room,
      agentName: dispatch.agentName,
      state: dispatch.state,
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Agent dispatch created successfully",
      dispatch: {
        dispatchId: dispatch.dispatchId,
        room: dispatch.room,
        agentName: dispatch.agentName,
        state: dispatch.state,
      },
    });
  } catch (error) {
    console.error("Error dispatching agent:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to dispatch agent" },
      { status: 500 }
    );
  }
}
