// src/components/MessageInput.tsx
import React, { useState } from "react";

interface Props {
  onSend: (text: string) => void;
  onTyping?: () => void;
}

const MessageInput: React.FC<Props> = ({ onSend, onTyping }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        padding: "var(--spacing-md)",
        borderTop: "1px solid #eee",
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "var(--spacing-sm)",
          alignItems: "flex-end",
        }}
      >
        <textarea
          className="input-field"
          style={{
            flex: 1,
            padding: "var(--spacing-sm) var(--spacing-md)",
            resize: "none",
            height: "auto",
            minHeight: "40px",
            maxHeight: "120px",
            borderRadius: "var(--radius-lg)",
            fontFamily: "var(--font-main)",
          }}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            // Send typing indicator
            if (e.target.value.trim() !== "") {
              onTyping?.();
            }
          }}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            padding: "var(--spacing-sm) var(--spacing-md)",
            borderRadius: "var(--radius-full)",
            minWidth: "40px",
            height: "40px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--gray)",
          marginTop: "var(--spacing-xs)",
          textAlign: "right",
        }}
      >
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

export default MessageInput;
