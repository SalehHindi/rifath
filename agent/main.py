#!/usr/bin/env python3
"""
LiveKit Voice Agent - Main Entry Point
"""

import logging
import os
from dotenv import load_dotenv

from livekit.agents import WorkerOptions, cli
from agent import entrypoint

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


if __name__ == "__main__":
    # Get configuration from environment
    livekit_url = os.getenv("LIVEKIT_URL")
    livekit_api_key = os.getenv("LIVEKIT_API_KEY")
    livekit_api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not all([livekit_url, livekit_api_key, livekit_api_secret]):
        logger.error(
            "Missing required environment variables: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET"
        )
        exit(1)

    logger.info("Starting LiveKit Voice Agent...")
    logger.info(f"Connecting to LiveKit server: {livekit_url}")

    # Create worker options
    # Note: In dev mode, agents should auto-dispatch when participants join
    # The agent_name can be left empty for auto-dispatch, or set to a specific name
    worker_options = WorkerOptions(
        entrypoint_fnc=entrypoint,
        api_key=livekit_api_key,
        api_secret=livekit_api_secret,
        ws_url=livekit_url,
        agent_name="voice-assistant",  # Optional: give agent a name for easier identification
    )

    # Run the agent using CLI - this will handle commands like 'dev', 'start', etc.
    cli.run_app(worker_options)
