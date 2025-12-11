"use client";

export function PlaceholderComponent() {
  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center p-8">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Component Area
        </h3>
        <p className="text-gray-500">
          This area will display different components based on voice commands.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Components will appear here when requested.
        </p>
      </div>
    </div>
  );
}

