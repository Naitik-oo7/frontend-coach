// src/components/ConversationList.tsx
import React from "react";

export interface Conversation {
  conversationId: string;
  lastMessageAt: string | null;
  unread: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const ConversationList: React.FC<Props> = ({
  conversations,
  activeId,
  onSelect,
}) => {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {conversations.map((c) => (
        <li
          key={c.conversationId}
          onClick={() => onSelect(c.conversationId)}
          style={{
            padding: "6px 8px",
            cursor: "pointer",
            background: c.conversationId === activeId ? "#eee" : "transparent",
            fontWeight: c.unread ? "bold" : "normal",
            borderBottom: "1px solid #ddd",
          }}
        >
          {c.user.name}
          {c.unread ? " (unread)" : ""}
        </li>
      ))}
    </ul>
  );
};

export default ConversationList;
