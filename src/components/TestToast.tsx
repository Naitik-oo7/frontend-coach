import React from "react";
import { useToast } from "../hooks/useToast";

const TestToast: React.FC = () => {
  const toast = useToast();

  const showSuccess = () => {
    toast.success("This is a success message!");
  };

  const showError = () => {
    toast.error("This is an error message!");
  };

  const showWarning = () => {
    toast.warning("This is a warning message!");
  };

  const showInfo = () => {
    toast.info("This is an info message!");
  };

  const showPromise = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 3000)), {
      loading: "Loading...",
      success: "Loaded successfully!",
      error: "Failed to load",
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Toast Notification Test</h2>
      <p className="mb-4">
        Click the buttons below to test different toast types:
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          onClick={showSuccess}
        >
          Success Toast
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          onClick={showError}
        >
          Error Toast
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          onClick={showWarning}
        >
          Warning Toast
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={showInfo}
        >
          Info Toast
        </button>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          onClick={showPromise}
        >
          Promise Toast
        </button>
      </div>
    </div>
  );
};

export default TestToast;
