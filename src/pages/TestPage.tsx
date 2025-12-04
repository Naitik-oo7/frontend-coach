// src/pages/TestPage.tsx
import React from "react";
import TestTailwind from "../components/TestTailwind";
import TestToast from "../components/TestToast";

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl mb-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
          Tailwind CSS Test Page
        </h1>
        <TestTailwind />
        <div className="mt-6 flex space-x-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Button 1
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Button 2
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
          Toast Notification Test
        </h1>
        <TestToast />
      </div>
    </div>
  );
};

export default TestPage;
