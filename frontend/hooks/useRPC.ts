"use client";

import { useEffect, useRef } from "react";
import { Room } from "livekit-client";
import { useMode } from "@/contexts/ModeContext";
import { useQuiz } from "@/contexts/QuizContext";
import { UIMode } from "@/components/ModeRenderer";

export function useRPC(room: Room | null) {
  const { setMode, currentMode } = useMode();
  const currentModeRef = useRef(currentMode);
  const {
    quizState,
    loadQuiz,
    selectOption,
    nextQuestion,
    getCurrentQuestion,
    isAnswerCorrect,
    hasAnswered,
  } = useQuiz();
  const quizStateRef = useRef(quizState);
  
  // Keep refs in sync
  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);

  useEffect(() => {
    quizStateRef.current = quizState;
  }, [quizState]);

  useEffect(() => {
    if (!room) return;

    // Register set_mode RPC method
    const setModeHandler = async (request: any) => {
      try {
        // Parse payload - LiveKit RPC payloads are strings, so we need to parse JSON
        let payload: { mode?: string };
        if (typeof request.payload === "string") {
          payload = JSON.parse(request.payload);
        } else {
          payload = request.payload;
        }
        
        const { mode } = payload;
        
        if (!mode) {
          return {
            success: false,
            error: "Missing 'mode' parameter",
          };
        }
        
        // Validate mode
        const validModes: UIMode[] = ["blank", "quiz", "table", "placeholder"];
        if (!validModes.includes(mode as UIMode)) {
          return {
            success: false,
            error: `Invalid mode: ${mode}. Valid modes are: ${validModes.join(", ")}`,
          };
        }

        // Update mode
        setMode(mode as UIMode);
        
        // Return JSON string (LiveKit expects string response)
        return JSON.stringify({ success: true, mode });
      } catch (error) {
        console.error("Error in set_mode RPC:", error);
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    // Register get_mode RPC method
    const getModeHandler = async (_request: any) => {
      try {
        // Return JSON string (LiveKit expects string response)
        return JSON.stringify({
          success: true,
          mode: currentModeRef.current,
        });
      } catch (error) {
        console.error("Error in get_mode RPC:", error);
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    // Register load_quiz RPC method
    const loadQuizHandler = async (_request: any) => {
      try {
        loadQuiz();
        const currentQuestion = getCurrentQuestion();
        return JSON.stringify({
          success: true,
          message: "Quiz loaded",
          question: currentQuestion?.question || "",
          options: currentQuestion?.options || {},
        });
      } catch (error) {
        console.error("Error in load_quiz RPC:", error);
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    // Register select_option RPC method
    const selectOptionHandler = async (request: any) => {
      try {
        let payload: { option?: string };
        if (typeof request.payload === "string") {
          payload = JSON.parse(request.payload);
        } else {
          payload = request.payload;
        }

        const { option } = payload;

        if (!option) {
          return JSON.stringify({
            success: false,
            error: "Missing 'option' parameter",
          });
        }

        // Validate option (A, B, C, or D)
        const validOptions = ["A", "B", "C", "D"];
        if (!validOptions.includes(option.toUpperCase())) {
          return JSON.stringify({
            success: false,
            error: `Invalid option: ${option}. Valid options are: ${validOptions.join(", ")}`,
          });
        }

        // Get current question before selecting (to determine correctness)
        const currentQuestion = getCurrentQuestion();
        if (!currentQuestion) {
          return JSON.stringify({
            success: false,
            error: "No active quiz question",
          });
        }

        const optionUpper = option.toUpperCase();
        const isCorrect = optionUpper === currentQuestion.correctAnswer;

        selectOption(optionUpper);

        return JSON.stringify({
          success: true,
          option: optionUpper,
          isCorrect: isCorrect,
          correctAnswer: currentQuestion.correctAnswer,
        });
      } catch (error) {
        console.error("Error in select_option RPC:", error);
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    // Register next_question RPC method
    const nextQuestionHandler = async (_request: any) => {
      try {
        const currentIndex = quizStateRef.current.currentQuestionIndex;
        const totalQuestions = quizStateRef.current.questions.length;
        const wasLastQuestion = currentIndex === totalQuestions - 1;

        // Call nextQuestion which updates state and ref synchronously
        nextQuestion();

        // Wait a tiny bit to ensure state update is processed
        await new Promise(resolve => setTimeout(resolve, 10));

        // Read updated state from ref (which was updated synchronously)
        const updatedState = quizStateRef.current;

        if (wasLastQuestion || updatedState.quizStatus === "completed") {
          return JSON.stringify({
            success: true,
            message: "Quiz completed",
            score: updatedState.score,
            totalQuestions: updatedState.totalQuestions,
          });
        }

        // Get the current question from the updated state
        const currentQuestion =
          updatedState.questions.length > 0 &&
          updatedState.currentQuestionIndex < updatedState.questions.length
            ? updatedState.questions[updatedState.currentQuestionIndex]
            : null;

        if (!currentQuestion) {
          return JSON.stringify({
            success: false,
            error: "No question available after moving to next question",
          });
        }

        return JSON.stringify({
          success: true,
          message: "Moved to next question",
          question: currentQuestion.question,
          options: currentQuestion.options,
          questionNumber: updatedState.currentQuestionIndex + 1,
          currentQuestionIndex: updatedState.currentQuestionIndex,
        });
      } catch (error) {
        console.error("Error in next_question RPC:", error);
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    // Register get_quiz_state RPC method
    const getQuizStateHandler = async (_request: any) => {
      try {
        // Read directly from ref to get most up-to-date state
        const state = quizStateRef.current;
        const currentQuestion =
          state.questions.length > 0 &&
          state.currentQuestionIndex < state.questions.length
            ? state.questions[state.currentQuestionIndex]
            : null;

        return JSON.stringify({
          success: true,
          quizStatus: state.quizStatus,
          currentQuestionIndex: state.currentQuestionIndex,
          totalQuestions: state.totalQuestions,
          selectedOption: state.selectedOption,
          score: state.score,
          hasAnswered: state.selectedOption !== null,
          currentQuestion: currentQuestion
            ? {
                question: currentQuestion.question,
                options: currentQuestion.options,
                correctAnswer: currentQuestion.correctAnswer,
              }
            : null,
        });
      } catch (error) {
        console.error("Error in get_quiz_state RPC:", error);
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    // Register RPC methods
    room.registerRpcMethod("set_mode", setModeHandler);
    room.registerRpcMethod("get_mode", getModeHandler);
    room.registerRpcMethod("load_quiz", loadQuizHandler);
    room.registerRpcMethod("select_option", selectOptionHandler);
    room.registerRpcMethod("next_question", nextQuestionHandler);
    room.registerRpcMethod("get_quiz_state", getQuizStateHandler);

    console.log(
      "RPC methods registered: set_mode, get_mode, load_quiz, select_option, next_question, get_quiz_state"
    );

    // Cleanup
    return () => {
      // Note: LiveKit doesn't have unregisterRpcMethod, but methods are cleaned up when room disconnects
    };
  }, [
    room,
    setMode,
    loadQuiz,
    selectOption,
    nextQuestion,
    getCurrentQuestion,
    isAnswerCorrect,
    hasAnswered,
  ]);
}

