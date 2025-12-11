"use client";

import { motion } from "framer-motion";

interface OptionButtonProps {
  optionKey: string;
  optionText: string;
  isSelected: boolean;
  isCorrect: boolean | null;
  onClick: () => void;
  disabled?: boolean;
}

export function OptionButton({
  optionKey,
  optionText,
  isSelected,
  isCorrect,
  onClick,
  disabled = false,
}: OptionButtonProps) {
  // Determine button styling based on state
  const getButtonStyles = () => {
    if (disabled && isSelected) {
      // Show correct/incorrect feedback after selection
      if (isCorrect === true) {
        return "bg-green-500 text-white border-green-600";
      } else if (isCorrect === false) {
        return "bg-red-500 text-white border-red-600";
      }
    }
    if (isSelected) {
      return "bg-blue-500 text-white border-blue-600";
    }
    return "bg-white text-gray-900 border-gray-300 hover:border-blue-400 hover:bg-blue-50";
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-4 rounded-lg border-2 text-left
        transition-all duration-200
        ${getButtonStyles()}
        ${disabled ? "cursor-not-allowed opacity-90" : "cursor-pointer"}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`
              font-bold text-lg
              ${isSelected && (isCorrect === true || isCorrect === false)
                ? "text-white"
                : isSelected
                ? "text-white"
                : "text-gray-500"}
            `}
          >
            {optionKey}.
          </span>
          <span className="font-medium">{optionText}</span>
        </div>
        {disabled && isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isCorrect === true ? (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : isCorrect === false ? (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : null}
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

