"use client";

import { useQuiz } from "@/contexts/QuizContext";
import { QuestionCard } from "./QuestionCard";
import { OptionButton } from "./OptionButton";
import { NextButton } from "./NextButton";
import { motion, AnimatePresence } from "framer-motion";

export function QuizComponent() {
  const {
    quizState,
    selectOption,
    nextQuestion,
    hasAnswered,
  } = useQuiz();

  // Get current question directly from state instead of using ref-based function
  const currentQuestion =
    quizState.questions.length > 0 &&
    quizState.currentQuestionIndex < quizState.questions.length
      ? quizState.questions[quizState.currentQuestionIndex]
      : null;

  const isLastQuestion =
    quizState.currentQuestionIndex === quizState.questions.length - 1;

  // Show completion screen
  if (quizState.quizStatus === "completed") {
    const percentage = Math.round(
      (quizState.score / quizState.totalQuestions) * 100
    );

    return (
      <div className="w-full h-full min-h-[400px] bg-white rounded-lg border border-gray-200 p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quiz Completed!
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored {quizState.score} out of {quizState.totalQuestions}
          </p>
          <div className="text-4xl font-bold text-blue-600 mb-8">
            {percentage}%
          </div>
          <p className="text-gray-500">
            Great job! You can ask the agent to start a new quiz anytime.
          </p>
        </motion.div>
      </div>
    );
  }

  // Show idle state (quiz not loaded)
  if (quizState.quizStatus === "idle" || !currentQuestion) {
  return (
    <div className="w-full h-full min-h-[400px] bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready for a Quiz?
            </h3>
          <p className="text-gray-500">
              Ask the agent to start a quiz, or say "give me a trivia question"
          </p>
        </div>
      </div>
    </div>
  );
}

  // Show active quiz
  const options = Object.entries(currentQuestion.options);

  return (
    <div className="w-full h-full min-h-[400px] bg-white rounded-lg border border-gray-200 p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={quizState.currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionCard
            question={currentQuestion.question}
            questionNumber={quizState.currentQuestionIndex + 1}
            totalQuestions={quizState.totalQuestions}
          />

          <div className="space-y-3 mb-6">
            {options.map(([key, text]) => (
              <OptionButton
                key={key}
                optionKey={key}
                optionText={text}
                isSelected={quizState.selectedOption === key}
                isCorrect={
                  hasAnswered()
                    ? key === currentQuestion.correctAnswer
                    : null
                }
                onClick={() => selectOption(key)}
                disabled={hasAnswered()}
              />
            ))}
          </div>

          {hasAnswered() && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <NextButton
                onClick={nextQuestion}
                isLastQuestion={isLastQuestion}
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
