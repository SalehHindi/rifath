"""
LiveKit Voice Agent - Main Agent Class
"""

import asyncio
import logging
from livekit import agents
from livekit.agents import (
    JobContext,
    WorkerOptions,
    cli,
    AgentSession,
    Agent,
)
from livekit.plugins import openai, silero
from tools import create_mode_tools, create_quiz_tools

logger = logging.getLogger(__name__)


async def entrypoint(ctx: JobContext):
    """
    Entry point for agent jobs.
    This function is called when a new agent job is created.
    """
    logger.info("🎉 Agent job started")
    logger.info(f"Room: {ctx.room.name}")

    # Connect the agent to the room first
    logger.info("Connecting agent to room...")
    await ctx.connect()
    logger.info("✅ Agent connected to room")

    # Wait for participant to connect (this will block until a participant joins)
    logger.info("Waiting for participant to connect...")
    await ctx.wait_for_participant()
    logger.info("✅ Participant connected, agent ready")

    # Set agent as participant kind
    # This makes it appear as an agent in the frontend
    await ctx.room.local_participant.set_attributes(
        {"kind": "agent", "name": "Voice Assistant"}
    )

    logger.info("Setting up voice pipeline (STT, LLM, TTS)...")

    # Create tools for mode switching between quiz/table/blank views
    mode_tools = create_mode_tools(ctx.room)
    logger.info(f"Created {len(mode_tools)} tools for mode control")

    # Create tools for quiz interaction
    quiz_tools = create_quiz_tools(ctx.room)
    logger.info(f"Created {len(quiz_tools)} tools for quiz control")

    # Combine all tools
    all_tools = mode_tools + quiz_tools
    logger.info(f"Total tools available: {len(all_tools)}")

    # Create agent with instructions + tools
    agent = Agent(
        instructions=(
            "You are a helpful voice assistant that can control the on-screen UI and interact with quizzes.\n"
            "\n"
            "UI Mode Control:\n"
            "- When the user asks to see a quiz or trivia, call the show_quiz tool first, then request_quiz to load it.\n"
            "- When the user asks to see a table, call the show_table tool.\n"
            "- When the user asks to clear or hide everything, call the show_blank tool.\n"
            "- Use get_current_mode if you need to verify what is displayed.\n"
            "\n"
            "Quiz Interaction:\n"
            "- Use request_quiz to load and start a quiz when the user wants to play.\n"
            "- IMPORTANT: When a quiz is active, ALWAYS call get_quiz_state first to see the current question before responding to the user. This ensures you know exactly what question is displayed.\n"
            "- When the user says they want to select an option (like 'I choose A' or 'select B'), use select_quiz_option with the option letter.\n"
            "- When the user wants to move to the next question, use next_quiz_question. After calling next_quiz_question, the tool will return the new question information - use that to confirm what question is now displayed.\n"
            "- After any quiz action (selecting option, moving to next question), verify the current state by checking the tool response or calling get_quiz_state if needed.\n"
            "- Always read the current question and options to the user when they ask about the quiz or when a new question appears.\n"
            "\n"
            "General:\n"
            "Wait for the user to speak (they press Push-to-Talk) before responding. "
            "Speak briefly, describe any UI changes you make, and stay conversational. "
            "When a quiz is active, always be aware of which question number is currently displayed and what the question text is. "
            "If you notice any inconsistencies (like the same question appearing twice), call get_quiz_state to verify the actual state."
        ),
        tools=all_tools,
    )

    # Create agent session with STT, LLM, TTS, and VAD
    # VAD (Voice Activity Detection) is REQUIRED for non-streaming STT like OpenAI Whisper
    session = AgentSession(
        vad=silero.VAD.load(),  # Voice Activity Detection - required for OpenAI STT
        stt=openai.STT(),  # Speech-to-Text using OpenAI Whisper
        llm=openai.LLM(
            model="gpt-4o",
        ),  # Language model using GPT-4
        tts=openai.TTS(),  # Text-to-Speech using OpenAI TTS
    )

    try:
        # Start the session (this call blocks until the session shuts down)
        logger.info("Starting agent session...")
        await session.start(agent=agent, room=ctx.room)

        logger.info("✅ Agent session started")
        logger.info("🎤 Agent is ready - waiting for user to press Push-to-Talk")
        logger.info("   The agent will only process audio when the microphone is enabled")

        # Keep the task alive until the job is cancelled or the call ends
        await asyncio.sleep(float("inf"))

    except asyncio.CancelledError:
        logger.info("Agent job cancelled")
        raise
    except Exception as e:
        logger.error(f"Error in agent session: {e}", exc_info=True)
        raise
    finally:
        # Ensure session is closed (safe to call even if already closed)
        logger.info("Cleaning up agent session...")
        try:
            await session.aclose()
            logger.info("✅ Session closed cleanly")
        except Exception as close_error:
            logger.warning(f"Error while closing session: {close_error}")


if __name__ == "__main__":
    # Run the agent using the CLI
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
