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
    <div style={{ overflowY: "auto" }}>
      {conversations.map((c, index) => (
        <div
          key={c.conversationId}
          onClick={() => onSelect(c.conversationId)}
          className={`${c.conversationId === activeId ? "card" : ""} ${
            index % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"
          }`}
          style={{
            padding: "var(--spacing-md)",
            cursor: "pointer",
            background: c.conversationId === activeId ? "white" : "transparent",
            fontWeight: c.unread ? "bold" : "normal",
            borderBottom: "1px solid #eee",
            transition: "all 0.2s ease",
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
            animationDelay: `${index * 0.05}s`,
          }}
          onMouseEnter={(e) => {
            if (c.conversationId !== activeId) {
              e.currentTarget.style.background = "#f0f0f5";
            }
          }}
          onMouseLeave={(e) => {
            if (c.conversationId !== activeId) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          <div
            className="avatar"
            style={{
              backgroundColor: c.unread ? "var(--secondary)" : "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "white",
            }}
          >
            {c.user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--spacing-xs)",
              }}
            >
              <div
                style={{
                  fontWeight: c.unread ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.user.name}
              </div>
              {c.unread && (
                <div className="badge badge-unread animate-bounce">New</div>
              )}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--gray)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.lastMessageAt
                ? new Date(c.lastMessageAt).toLocaleDateString()
                : "No messages yet"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
