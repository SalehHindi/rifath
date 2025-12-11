# LiveKit Agent Setup

## Prerequisites

- Python 3.10 or higher
- Virtual environment (recommended)

## Setup

1. **Create and activate virtual environment:**

   ```bash
   # Create virtual environment (if not already created)
   python3 -m venv venv

   # Activate virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   # venv\Scripts\activate
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env and add your credentials
   ```

4. **Run the agent:**

   For development mode:
   ```bash
   python main.py dev
   ```

   For production mode:
   ```bash
   python main.py start
   ```

   The agent will start and wait for jobs. When a user connects to a room, the agent will be dispatched automatically (in development mode) or you can dispatch it manually via the LiveKit API.

   **Note:** The CLI requires a command (`dev` or `start`). Running `python main.py` without a command will show an error.

## Virtual Environment

Always activate the virtual environment before running the agent:

```bash
source venv/bin/activate
```

To deactivate:
```bash
deactivate
```

## Environment Variables

Required variables in `.env`:
- `LIVEKIT_URL` - LiveKit server URL (e.g., `wss://your-project.livekit.cloud`)
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `OPENAI_API_KEY` - OpenAI API key (for LLM/STT/TTS - needed in later chunks)

## Testing

1. Start the agent:
   ```bash
   python main.py
   ```

2. In another terminal, start the frontend and connect to a room

3. The agent should automatically connect when you join the room

4. Check the agent logs to see connection status

## Troubleshooting

- **Agent doesn't connect**: Make sure LiveKit server is running and credentials are correct
- **Import errors**: Make sure virtual environment is activated and dependencies are installed
- **Connection errors**: Check that `LIVEKIT_URL` uses `wss://` for secure connections or `ws://` for local
