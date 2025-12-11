"use client";

export function QuizComponent() {
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Component</h3>
          <p className="text-gray-500">
            Quiz functionality will be implemented in Phase 3
          </p>
          <p className="text-sm text-gray-400 mt-2">
            This is a placeholder for the quiz component
          </p>
        </div>
      </div>
    </div>
  );
}

