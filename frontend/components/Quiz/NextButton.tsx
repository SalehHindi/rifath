"use client";

import { motion } from "framer-motion";

interface NextButtonProps {
  onClick: () => void;
  isLastQuestion: boolean;
}

export function NextButton({ onClick, isLastQuestion }: NextButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="
        mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg
        hover:bg-blue-700 transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        shadow-lg
      "
    >
      {isLastQuestion ? "Finish Quiz" : "Next Question"}
      <svg
        className="inline-block ml-2 w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </motion.button>
  );
}

