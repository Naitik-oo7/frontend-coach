// src/components/MessageInput.tsx
import React, { useState } from "react";

interface Props {
  onSend: (text: string) => void;
}

const MessageInput: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div>
      <input
        style={{ width: "100%", padding: 6, marginBottom: 4 }}
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button style={{ width: "100%", padding: 6 }} onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
