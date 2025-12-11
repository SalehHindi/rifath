"use client";

export function BlankComponent() {
  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <p className="text-gray-400 text-lg">Blank Screen</p>
      </div>
    </div>
  );
}

