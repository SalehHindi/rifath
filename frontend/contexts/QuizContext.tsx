"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { QuizQuestion, quizData } from "@/lib/quiz-data";

export type QuizStatus = "idle" | "active" | "completed";

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedOption: string | null;
  quizStatus: QuizStatus;
  score: number;
  totalQuestions: number;
}

interface QuizContextType {
  quizState: QuizState;
  loadQuiz: () => void;
  selectOption: (option: string) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  getCurrentQuestion: () => QuizQuestion | null;
  isAnswerCorrect: () => boolean | null;
  hasAnswered: () => boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    selectedOption: null,
    quizStatus: "idle",
    score: 0,
    totalQuestions: 0,
  });

  // Keep a ref for RPC handlers to access current state
  const quizStateRef = useRef(quizState);
  useEffect(() => {
    quizStateRef.current = quizState;
  }, [quizState]);

  const loadQuiz = useCallback(() => {
    const newState = {
      questions: quizData,
      currentQuestionIndex: 0,
      selectedOption: null,
      quizStatus: "active" as QuizStatus,
      score: 0,
      totalQuestions: quizData.length,
    };
    // Update ref synchronously before state update
    quizStateRef.current = newState;
    setQuizState(newState);
  }, []);

  const selectOption = useCallback((option: string) => {
    setQuizState((prev) => {
      // Only allow selection if quiz is active and no option is selected yet
      if (prev.quizStatus !== "active" || prev.selectedOption !== null) {
        return prev;
      }

      const currentQuestion = prev.questions[prev.currentQuestionIndex];
      const isCorrect = option === currentQuestion.correctAnswer;
      const newScore = isCorrect ? prev.score + 1 : prev.score;

      const newState = {
        ...prev,
        selectedOption: option,
        score: newScore,
      };
      // Update ref synchronously
      quizStateRef.current = newState;
      return newState;
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setQuizState((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;

      let newState;
      if (nextIndex >= prev.questions.length) {
        // Quiz completed
        newState = {
          ...prev,
          quizStatus: "completed" as QuizStatus,
          currentQuestionIndex: prev.questions.length - 1,
          selectedOption: null,
        };
      } else {
        // Move to next question
        newState = {
          ...prev,
          currentQuestionIndex: nextIndex,
          selectedOption: null,
        };
      }
      // Update ref synchronously
      quizStateRef.current = newState;
      return newState;
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizState({
      questions: [],
      currentQuestionIndex: 0,
      selectedOption: null,
      quizStatus: "idle",
      score: 0,
      totalQuestions: 0,
    });
  }, []);

  const getCurrentQuestion = useCallback((): QuizQuestion | null => {
    const { questions, currentQuestionIndex } = quizStateRef.current;
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return null;
    }
    return questions[currentQuestionIndex];
  }, []);

  const isAnswerCorrect = useCallback((): boolean | null => {
    const { selectedOption, questions, currentQuestionIndex } = quizStateRef.current;
    if (selectedOption === null) {
      return null;
    }
    const currentQuestion = questions[currentQuestionIndex];
    return selectedOption === currentQuestion.correctAnswer;
  }, []);

  const hasAnswered = useCallback((): boolean => {
    return quizStateRef.current.selectedOption !== null;
  }, []);

  return (
    <QuizContext.Provider
      value={{
        quizState,
        loadQuiz,
        selectOption,
        nextQuestion,
        resetQuiz,
        getCurrentQuestion,
        isAnswerCorrect,
        hasAnswered,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}

