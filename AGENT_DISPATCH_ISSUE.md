# Agent Dispatch Issue - Current Status

## Problem
Agent worker is running and registered, but not receiving jobs when participants join the room.

## Current Setup
- ✅ Agent worker running: `python3 main.py dev`
- ✅ Agent worker registered with LiveKit Cloud
- ✅ Frontend connecting to room successfully
- ❌ Agent job NOT being created/dispatched

## What Should Happen
When you connect from the frontend:
1. Frontend connects to room
2. LiveKit Cloud should dispatch an agent job
3. Agent worker should receive the job
4. Agent should connect to room
5. Agent should appear as participant

## What's Actually Happening
- Frontend connects ✅
- Agent worker registered ✅
- But no "Agent job started" log ❌

## Possible Solutions

### Option 1: Use Local LiveKit Server (Recommended for Development)
Instead of LiveKit Cloud, use a local LiveKit server:

```bash
# Start local LiveKit server
docker-compose up -d

# Update .env files to use ws://localhost:7880
```

### Option 2: Check LiveKit Cloud Agent Configuration
LiveKit Cloud might require:
- Agent dispatch to be enabled in project settings
- Specific agent configuration
- Or agents need to be deployed to LiveKit Cloud (not local)

### Option 3: Manual Agent Connection
We could have the agent connect directly to the room (bypassing job dispatch), but this is not the standard pattern.

## Next Steps
1. Check LiveKit Cloud dashboard for agent dispatch settings
2. Try using local LiveKit server instead
3. Check agent worker logs for any errors
4. Verify agent worker is properly registered (check the "registered worker" log)

## Debugging Commands

Check if agent worker is receiving jobs:
- Watch agent logs when connecting from frontend
- Should see "Agent job started" immediately after frontend connects

Check agent worker registration:
- Agent logs show: "registered worker" with worker ID
- This confirms worker is registered with LiveKit Cloud

