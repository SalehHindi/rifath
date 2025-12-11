# Switch to Local LiveKit Server for Development

## Why Switch?
LiveKit Cloud may not automatically dispatch local agent workers. Using a local LiveKit server ensures agent dispatch works correctly in development.

## Steps to Switch

### 1. Start Local LiveKit Server

```bash
# From project root
docker-compose up -d
```

Verify it's running:
```bash
docker-compose ps
# Should show livekit container running
```

### 2. Update Frontend .env.local

Edit `frontend/.env.local`:
```bash
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret
```

### 3. Update Agent .env

Edit `agent/.env`:
```bash
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Restart Everything

1. **Restart agent worker:**
   ```bash
   cd agent
   source venv/bin/activate
   python3 main.py dev
   ```

2. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### 5. Test

1. Connect from frontend
2. Check agent logs - should see "Agent job started" immediately
3. Check browser console - should see "Agent participant detected"
4. You should hear the agent's greeting

## Benefits of Local Server
- ✅ Agent dispatch works automatically
- ✅ No cloud dependencies
- ✅ Faster for development
- ✅ Free (no cloud costs)
- ✅ Full control

## Switching Back to Cloud
When ready for production, switch back to LiveKit Cloud by updating the .env files with your cloud credentials.

