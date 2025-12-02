// src/components/MessageList.tsx
import React from "react";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface Props {
  messages: Message[];
  currentUserId: string;
}

const MessageList: React.FC<Props> = ({ messages, currentUserId }) => {
  return (
    <div
      id="messages"
      style={{
        border: "1px solid #ccc",
        height: 300,
        overflowY: "auto",
        padding: 8,
        marginBottom: 8,
      }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          style={{
            textAlign: m.senderId === currentUserId ? "right" : "left",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "4px 8px",
              borderRadius: 4,
              background: m.senderId === currentUserId ? "#d1ffd1" : "#f1f1f1",
            }}
          >
            {m.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
