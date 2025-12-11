# Setting Up Local LiveKit Server

## Option 1: Using Docker (Recommended)

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

### 2. Verify Configuration

The docker-compose.yml is configured to run LiveKit in dev mode with:
- **API Key**: `devkey`
- **API Secret**: `secret`
- **URL**: `ws://localhost:7880`

## Option 2: Using LiveKit CLI (Alternative)

If you have LiveKit CLI installed:

```bash
# Install LiveKit CLI (macOS)
brew update && brew install livekit

# Start server in dev mode
livekit-server --dev
```

This uses the same credentials (`devkey`/`secret`) and runs on `localhost:7880`.

## Configuration Files

Both `.env` files have been updated to use local server:
- `frontend/.env.local` → `ws://localhost:7880` with `devkey`/`secret`
- `agent/.env` → `ws://localhost:7880` with `devkey`/`secret`

## Testing

1. **Start LiveKit server** (Docker or CLI)
2. **Start agent worker:**
   ```bash
   cd agent
   source venv/bin/activate
   python3 main.py dev
   ```
   You should see: "registered worker"

3. **Start frontend:**
   ```bash
   cd frontend
   pnpm run dev
   ```

4. **Connect from frontend:**
   - Click "Connect" button
   - Check agent logs - should see "Agent job started" immediately
   - Check browser console - should see agent participant
   - You should hear the agent's greeting!

## Why Local Server?

- ✅ **Auto-dispatch works**: Local agent workers automatically receive jobs when participants join
- ✅ **No cloud dependencies**: Everything runs locally
- ✅ **Faster development**: No network latency
- ✅ **Free**: No cloud costs
- ✅ **Full control**: Complete debugging capabilities

## Reference

- [LiveKit Local Setup Docs](https://docs.livekit.io/home/self-hosting/local/)
- Dev mode uses: API key `devkey`, API secret `secret`

