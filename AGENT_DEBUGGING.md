# Agent Debugging Guide

## Issue: Agent Not Speaking

If you don't hear the agent speaking, check the following:

### 1. Verify Agent is Running

```bash
cd agent
source venv/bin/activate
python3 main.py dev
```

You should see:
- "Starting LiveKit Voice Agent..."
- "registered worker"
- "HTTP server listening on :[port]"

### 2. Check Agent Logs

When you connect from the frontend, the agent logs should show:
- "Agent job started: [job_id]"
- "Participant connected, agent ready"
- "Setting up voice pipeline (STT, LLM, TTS)..."
- "Starting agent session..."
- "Generating initial greeting..."

### 3. Check Browser Console

After connecting, check the browser console for:
- "Participant connected:" - Should show agent participant
- "✅ Agent participant detected" - Confirms agent is detected
- "Agent audio track subscribed" - Confirms audio track is subscribed
- "✅ Attaching existing agent audio track" - Confirms audio is attached

### 4. Verify Agent Dispatch

**Important**: For LiveKit Cloud, agents need to be properly dispatched. The agent worker running locally should auto-dispatch when a participant joins, but this requires:

1. Agent worker is running and registered with LiveKit Cloud
2. Agent worker is connected to the same LiveKit Cloud instance
3. Agent dispatch is enabled (should be automatic in dev mode)

### 5. Check Room Participants

In the browser console, check:
```javascript
// In browser console after connecting
room.remoteParticipants.forEach(p => {
  console.log({
    identity: p.identity,
    kind: p.attributes?.get("kind"),
    sid: p.sid,
  });
});
```

You should see an agent participant with `kind: "agent"`.

### 6. Common Issues

**Issue**: Agent worker running but no job dispatched
- **Solution**: Make sure agent worker is connected to the same LiveKit Cloud instance
- Check agent logs for connection errors
- Verify LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET are correct

**Issue**: Agent connects but no audio
- **Solution**: Check browser console for audio track subscription
- Verify `useAgentAudio` hook is working
- Check browser audio permissions
- Verify audio element is created and attached

**Issue**: Agent doesn't respond to voice
- **Solution**: Check if microphone is enabled when pushing button
- Verify agent is receiving audio (check agent logs)
- Check OpenAI API key is set correctly

### 7. Manual Testing

Test agent connection:
1. Start agent: `python3 main.py dev`
2. Connect from frontend
3. Check agent logs for "Agent job started"
4. Check browser console for "Agent participant detected"
5. Press push-to-talk and speak
6. Check agent logs for STT transcription
7. Check agent logs for LLM response
8. Check agent logs for TTS generation

### 8. Debugging Commands

In browser console:
```javascript
// Check room state
console.log("Room:", room.name);
console.log("Participants:", room.remoteParticipants.size);
console.log("Local:", room.localParticipant.identity);

// Check for agent
room.remoteParticipants.forEach(p => {
  if (p.attributes?.get("kind") === "agent") {
    console.log("Agent found:", p.identity);
    console.log("Audio tracks:", p.audioTrackPublications.size);
  }
});

// Check audio element
const audioElements = document.querySelectorAll("audio");
console.log("Audio elements:", audioElements.length);
audioElements.forEach((el, i) => {
  console.log(`Audio ${i}:`, {
    src: el.src,
    paused: el.paused,
    currentTime: el.currentTime,
    readyState: el.readyState,
  });
});
```

