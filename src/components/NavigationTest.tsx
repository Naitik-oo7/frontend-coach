// src/components/NavigationTest.tsx
import React from "react";
import { Link } from "react-router-dom";

const NavigationTest: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">Tailwind Test</div>
        <div className="space-x-4">
          <Link
            to="/chat"
            className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Chat
          </Link>
          <Link
            to="/test"
            className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Test Page
          </Link>
          <button className="bg-white text-purple-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200">
            Test Button
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationTest;
