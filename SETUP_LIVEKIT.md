# LiveKit Server Setup

## Option 1: Docker (Recommended for Development)

1. Make sure Docker is installed and running

2. Start LiveKit server:
   ```bash
   docker-compose up -d
   ```

3. Verify it's running:
   ```bash
   docker-compose ps
   ```

4. The server will be available at `ws://localhost:7880`

5. Default credentials (for development):
   - API Key: `devkey`
   - API Secret: `devsecret`

6. Update your `.env.local` file:
   ```bash
   NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=devsecret
   ```

## Option 2: LiveKit Cloud (Free Tier)

1. Sign up at https://cloud.livekit.io

2. Create a new project

3. Get your credentials:
   - URL (e.g., `wss://your-project.livekit.cloud`)
   - API Key
   - API Secret

4. Update your `.env.local` file with the credentials

## Option 3: Manual Installation

See https://docs.livekit.io/home/self-hosting/deployment/

## Stopping the Server

If using Docker:
```bash
docker-compose down
```

## Testing the Server

Once running, you can test the connection by visiting:
- HTTP endpoint: http://localhost:7880 (should show LiveKit server info)

