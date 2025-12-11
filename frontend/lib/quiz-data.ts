export interface QuizQuestion {
  id: string;
  question: string;
  options: { [key: string]: string }; // { A: "Option 1", B: "Option 2", ... }
  correctAnswer: string; // "A", "B", "C", or "D"
}

export const quizData: QuizQuestion[] = [
  {
    id: "1",
    question: "What is the capital of France?",
    options: {
      A: "London",
      B: "Berlin",
      C: "Paris",
      D: "Madrid",
    },
    correctAnswer: "C",
  },
  {
    id: "2",
    question: "Which planet is known as the Red Planet?",
    options: {
      A: "Venus",
      B: "Mars",
      C: "Jupiter",
      D: "Saturn",
    },
    correctAnswer: "B",
  },
  {
    id: "3",
    question: "What is the largest ocean on Earth?",
    options: {
      A: "Atlantic Ocean",
      B: "Indian Ocean",
      C: "Arctic Ocean",
      D: "Pacific Ocean",
    },
    correctAnswer: "D",
  },
  {
    id: "4",
    question: "Who painted the Mona Lisa?",
    options: {
      A: "Vincent van Gogh",
      B: "Pablo Picasso",
      C: "Leonardo da Vinci",
      D: "Michelangelo",
    },
    correctAnswer: "C",
  },
  {
    id: "5",
    question: "What is the smallest prime number?",
    options: {
      A: "0",
      B: "1",
      C: "2",
      D: "3",
    },
    correctAnswer: "C",
  },
  {
    id: "6",
    question: "In which year did World War II end?",
    options: {
      A: "1943",
      B: "1944",
      C: "1945",
      D: "1946",
    },
    correctAnswer: "C",
  },
  {
    id: "7",
    question: "What is the chemical symbol for gold?",
    options: {
      A: "Go",
      B: "Gd",
      C: "Au",
      D: "Ag",
    },
    correctAnswer: "C",
  },
  {
    id: "8",
    question: "Which programming language is known as the 'language of the web'?",
    options: {
      A: "Python",
      B: "Java",
      C: "JavaScript",
      D: "C++",
    },
    correctAnswer: "C",
  },
];

