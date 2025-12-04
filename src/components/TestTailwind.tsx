// src/components/TestTailwind.tsx
import React from "react";

const TestTailwind: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-purple-600">Tailwind CSS Test</h1>
      <p className="mt-2 text-gray-700">
        If you can see this text in purple and gray with proper spacing,
        Tailwind CSS is working!
      </p>
      <div className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
        This should have a gradient background if Tailwind is working correctly.
      </div>
    </div>
  );
};

export default TestTailwind;
