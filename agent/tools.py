"""
Agent Tools for UI Mode Control
"""

import logging
from livekit.agents.llm import function_tool

logger = logging.getLogger(__name__)


def create_mode_tools(room):
    """Create tools for mode switching that can be used by the LLM."""

    @function_tool
    async def show_quiz() -> str:
        """Show a quiz interface to the user. Use this when the user asks for a quiz or trivia question."""
        try:
            result = await room.rpc.call("set_mode", {"mode": "quiz"})
            if result.get("success"):
                return "Quiz interface is now displayed. You can ask the user if they want to start a quiz."
            else:
                return f"Failed to show quiz: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in show_quiz tool: {e}")
            return f"Sorry, I encountered an error showing the quiz: {str(e)}"

    @function_tool
    async def show_table() -> str:
        """Show a table interface to the user. Use this when the user asks to see a table."""
        try:
            result = await room.rpc.call("set_mode", {"mode": "table"})
            if result.get("success"):
                return "Table interface is now displayed."
            else:
                return f"Failed to show table: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in show_table tool: {e}")
            return f"Sorry, I encountered an error showing the table: {str(e)}"

    @function_tool
    async def show_blank() -> str:
        """Clear the screen and show a blank interface. Use this when the user asks to clear the screen or show nothing."""
        try:
            result = await room.rpc.call("set_mode", {"mode": "blank"})
            if result.get("success"):
                return "Screen is now cleared and showing a blank interface."
            else:
                return f"Failed to clear screen: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in show_blank tool: {e}")
            return f"Sorry, I encountered an error clearing the screen: {str(e)}"

    @function_tool
    async def get_current_mode() -> str:
        """Get the current UI mode that is being displayed to the user."""
        try:
            result = await room.rpc.call("get_mode", {})
            if result.get("success"):
                mode = result.get("mode", "unknown")
                return f"The current UI mode is: {mode}"
            else:
                return f"Failed to get current mode: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in get_current_mode tool: {e}")
            return f"Sorry, I encountered an error getting the current mode: {str(e)}"

    return [show_quiz, show_table, show_blank, get_current_mode]

