// src/components/MessageInput.tsx
import React, { useState, useRef, useEffect } from "react";

interface Props {
  onSend: (text: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

const MessageInput: React.FC<Props> = ({ onSend, onTyping, onStopTyping }) => {
  const [text, setText] = useState("");
  const isTypingRef = useRef(false);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    // Notify stop typing when message is sent
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onStopTyping?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Handle typing events
    if (newText.trim() !== "") {
      // User is typing
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTyping?.();
      }
    } else {
      // Text is empty, stop typing
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onStopTyping?.();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Notify stop typing when component unmounts
      if (isTypingRef.current) {
        onStopTyping?.();
      }
    };
  }, [onStopTyping]);

  return (
    <div className="p-4 border-t border-slate-200 bg-white">
      <div className="flex gap-2 items-end">
        <textarea
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none min-h-[40px] max-h-[120px] font-sans"
          placeholder="Type a message..."
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg min-w-[40px] h-[40px] flex items-center justify-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          onClick={handleSend}
          disabled={!text.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <div className="text-xs text-slate-500 mt-1 text-right">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

export default MessageInput;
