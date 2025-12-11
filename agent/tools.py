"""
Agent Tools for UI Mode Control
"""

import json
import logging
from livekit.agents.llm import function_tool

logger = logging.getLogger(__name__)


def _get_frontend_participant_identity(room):
    """Find the frontend participant identity by looking for non-agent participants."""
    # The frontend participant is the one that's not the agent
    # Iterate through remote participants to find the frontend user
    for participant in room.remote_participants.values():
        # Check if this participant is not an agent
        # The agent sets its kind attribute to "agent", so we look for participants without that
        attributes = participant.attributes or {}
        kind = attributes.get("kind", "")
        if kind != "agent":
            return participant.identity
    
    # If no remote participants found, return None
    # This shouldn't happen if wait_for_participant was called, but handle gracefully
    return None


async def _call_rpc_method(room, method: str, payload: dict) -> dict:
    """Helper function to call an RPC method on the frontend participant."""
    # Find the frontend participant identity
    frontend_identity = _get_frontend_participant_identity(room)
    
    if not frontend_identity:
        logger.error("No frontend participant found in room")
        return {"success": False, "error": "No frontend participant found"}
    
    try:
        # Convert payload dict to JSON string (RPC payload must be a string)
        payload_str = json.dumps(payload)
        
        # Call the RPC method using the correct LiveKit API
        response_str = await room.local_participant.perform_rpc(
            destination_identity=frontend_identity,
            method=method,
            payload=payload_str,
        )
        
        # Parse the response string back to a dict
        if response_str:
            try:
                return json.loads(response_str)
            except json.JSONDecodeError:
                # If response is not JSON, return as-is wrapped in a dict
                return {"success": True, "response": response_str}
        else:
            return {"success": False, "error": "Empty response from RPC call"}
            
    except Exception as e:
        logger.error(f"Error calling RPC method {method}: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


def create_mode_tools(room):
    """Create tools for mode switching that can be used by the LLM."""

    @function_tool
    async def show_quiz() -> str:
        """Show a quiz interface to the user. Use this when the user asks for a quiz or trivia question."""
        try:
            result = await _call_rpc_method(room, "set_mode", {"mode": "quiz"})
            if result.get("success"):
                return "Quiz interface is now displayed. You can ask the user if they want to start a quiz."
            else:
                return f"Failed to show quiz: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in show_quiz tool: {e}", exc_info=True)
            return f"Sorry, I encountered an error showing the quiz: {str(e)}"

    @function_tool
    async def show_table() -> str:
        """Show a table interface to the user. Use this when the user asks to see a table."""
        try:
            result = await _call_rpc_method(room, "set_mode", {"mode": "table"})
            if result.get("success"):
                return "Table interface is now displayed."
            else:
                return f"Failed to show table: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in show_table tool: {e}", exc_info=True)
            return f"Sorry, I encountered an error showing the table: {str(e)}"

    @function_tool
    async def show_blank() -> str:
        """Clear the screen and show a blank interface. Use this when the user asks to clear the screen or show nothing."""
        try:
            result = await _call_rpc_method(room, "set_mode", {"mode": "blank"})
            if result.get("success"):
                return "Screen is now cleared and showing a blank interface."
            else:
                return f"Failed to clear screen: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in show_blank tool: {e}", exc_info=True)
            return f"Sorry, I encountered an error clearing the screen: {str(e)}"

    @function_tool
    async def get_current_mode() -> str:
        """Get the current UI mode that is being displayed to the user."""
        try:
            result = await _call_rpc_method(room, "get_mode", {})
            if result.get("success"):
                mode = result.get("mode", "unknown")
                return f"The current UI mode is: {mode}"
            else:
                return f"Failed to get current mode: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in get_current_mode tool: {e}", exc_info=True)
            return f"Sorry, I encountered an error getting the current mode: {str(e)}"

    return [show_quiz, show_table, show_blank, get_current_mode]


def create_quiz_tools(room):
    """Create tools for quiz interaction that can be used by the LLM."""

    @function_tool
    async def request_quiz() -> str:
        """Load and display a quiz to the user. Use this when the user asks for a quiz, trivia questions, or wants to start a quiz."""
        try:
            # First, switch to quiz mode
            mode_result = await _call_rpc_method(room, "set_mode", {"mode": "quiz"})
            if not mode_result.get("success"):
                return f"Failed to switch to quiz mode: {mode_result.get('error', 'Unknown error')}"

            # Then load the quiz
            result = await _call_rpc_method(room, "load_quiz", {})
            if result.get("success"):
                question = result.get("question", "")
                options = result.get("options", {})
                options_str = ", ".join([f"{k}: {v}" for k, v in options.items()])
                return f"Quiz loaded! Current question: {question} Options: {options_str}"
            else:
                return f"Failed to load quiz: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in request_quiz tool: {e}", exc_info=True)
            return f"Sorry, I encountered an error loading the quiz: {str(e)}"

    @function_tool
    async def select_quiz_option(option: str) -> str:
        """Select an option (A, B, C, or D) for the current quiz question. Use this when the user says they want to choose an option, select an answer, or pick A/B/C/D.
        
        Args:
            option: The option to select, must be 'A', 'B', 'C', or 'D' (case insensitive)
        """
        try:
            result = await _call_rpc_method(room, "select_option", {"option": option})
            if result.get("success"):
                is_correct = result.get("isCorrect", False)
                correct_answer = result.get("correctAnswer", "")
                if is_correct:
                    return f"Correct! You selected option {option}, which is the right answer."
                else:
                    return f"Not quite. You selected option {option}, but the correct answer is {correct_answer}."
            else:
                return f"Failed to select option: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in select_quiz_option tool: {e}", exc_info=True)
            return f"Sorry, I encountered an error selecting the option: {str(e)}"

    @function_tool
    async def next_quiz_question() -> str:
        """Move to the next question in the quiz. Use this when the user wants to proceed to the next question or finish the current question.
        
        IMPORTANT: This tool returns the NEW question that is now displayed. Always use this information to confirm what question the user is seeing.
        """
        try:
            result = await _call_rpc_method(room, "next_question", {})
            if result.get("success"):
                if result.get("message") == "Quiz completed":
                    score = result.get("score", 0)
                    total = result.get("totalQuestions", 0)
                    percentage = int((score / total * 100)) if total > 0 else 0
                    return f"Quiz completed! You scored {score} out of {total} ({percentage}%). Great job!"
                else:
                    question = result.get("question", "")
                    options = result.get("options", {})
                    question_num = result.get("questionNumber", 0)
                    current_index = result.get("currentQuestionIndex", question_num - 1)
                    options_str = ", ".join([f"{k}: {v}" for k, v in options.items()])
                    return (
                        f"Successfully moved to question {question_num} (index {current_index}). "
                        f"The current question displayed is: {question} "
                        f"Options: {options_str}. "
                        f"Please read this question to the user."
                    )
            else:
                return f"Failed to move to next question: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in next_quiz_question tool: {e}", exc_info=True)
            return f"Sorry, I encountered an error moving to the next question: {str(e)}"

    @function_tool
    async def get_quiz_state() -> str:
        """Get the current state of the quiz, including the current question, selected option, and score. 
        
        Use this frequently when a quiz is active to ensure you know exactly what question is currently displayed to the user.
        Always call this before responding about quiz content to verify the current state.
        """
        try:
            result = await _call_rpc_method(room, "get_quiz_state", {})
            if result.get("success"):
                status = result.get("quizStatus", "unknown")
                question_data = result.get("currentQuestion")
                current_index = result.get("currentQuestionIndex", 0)
                
                if status == "idle":
                    return "No quiz is currently active. Use request_quiz to start a quiz."
                elif status == "completed":
                    score = result.get("score", 0)
                    total = result.get("totalQuestions", 0)
                    return f"Quiz completed. Final score: {score} out of {total}."
                else:
                    question_num = current_index + 1
                    total = result.get("totalQuestions", 0)
                    selected = result.get("selectedOption")
                    score = result.get("score", 0)
                    
                    if question_data:
                        question = question_data.get("question", "")
                        options = question_data.get("options", {})
                        options_str = ", ".join([f"{k}: {v}" for k, v in options.items()])
                        
                        state_str = (
                            f"CURRENT QUIZ STATE - Question {question_num} of {total} (index {current_index}): "
                            f"{question} "
                            f"Options: {options_str}. "
                        )
                        if selected:
                            state_str += f"User has selected: {selected}. "
                        state_str += f"Current score: {score}/{total}"
                        return state_str
                    else:
                        return (
                            f"Quiz is active but no question data available. "
                            f"Question {question_num} of {total} (index {current_index}). "
                            f"Score: {score}/{total}"
                        )
            else:
                return f"Failed to get quiz state: {result.get('error', 'Unknown error')}"
        except Exception as e:
            logger.error(f"Error in get_quiz_state tool: {e}", exc_info=True)
            return f"Sorry, I encountered an error getting the quiz state: {str(e)}"

    return [request_quiz, select_quiz_option, next_quiz_question, get_quiz_state]

