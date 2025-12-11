"use client";

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  return (
    <div className="mb-6">
      <div className="text-sm text-gray-500 mb-2">
        Question {questionNumber} of {totalQuestions}
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{question}</h2>
    </div>
  );
}

