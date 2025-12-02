// src/components/MessageList.tsx
import React, { useEffect, useRef } from "react";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

interface Props {
  messages: Message[];
  currentUserId: string;
  typingUsers?: string[];
  onMessagesViewed?: (messageIds: string[]) => void; // Add this prop
}

const MessageList: React.FC<Props> = ({
  messages,
  currentUserId,
  typingUsers = [],
  onMessagesViewed, // Destructure the new prop
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const viewedMessagesRef = useRef<Set<string>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to check which messages are in view
  const checkVisibleMessages = () => {
    if (!messagesContainerRef.current || !onMessagesViewed) return;

    const container = messagesContainerRef.current;
    const messageElements = container.querySelectorAll("[data-message-id]");

    const visibleMessageIds: string[] = [];

    messageElements.forEach((element) => {
      const messageId = element.getAttribute("data-message-id");
      if (!messageId) return;

      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Check if message is in view (with some tolerance)
      if (
        rect.top >= containerRect.top - 50 &&
        rect.bottom <= containerRect.bottom + 50
      ) {
        visibleMessageIds.push(messageId);
      }
    });

    // Filter out messages that were already marked as viewed
    const newVisibleMessageIds = visibleMessageIds.filter(
      (id) => !viewedMessagesRef.current.has(id)
    );

    // Add newly viewed messages to the set
    newVisibleMessageIds.forEach((id) => viewedMessagesRef.current.add(id));

    // Notify parent component about newly viewed messages
    if (newVisibleMessageIds.length > 0) {
      onMessagesViewed(newVisibleMessageIds);
    }
  };

  // Set up scroll listener to detect when messages come into view
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !onMessagesViewed) return;

    // Check visible messages initially
    setTimeout(checkVisibleMessages, 100);

    // Set up scroll listener
    container.addEventListener("scroll", checkVisibleMessages);

    // Also check when window resizes
    window.addEventListener("resize", checkVisibleMessages);

    return () => {
      container.removeEventListener("scroll", checkVisibleMessages);
      window.removeEventListener("resize", checkVisibleMessages);
    };
  }, [onMessagesViewed]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      id="messages"
      ref={messagesContainerRef} // Add ref to container
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "var(--spacing-md)",
        marginBottom: "var(--spacing-sm)",
        background: "linear-gradient(to bottom, #f0f0f5, #e6e6f0)",
      }}
    >
      {messages.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
            color: "var(--gray)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "var(--radius-full)",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--spacing-md)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <h3>No messages yet</h3>
          <p>Be the first to start the conversation!</p>
        </div>
      ) : (
        messages.map((m, index) => (
          <div
            key={m.id}
            data-message-id={m.id} // Add data attribute for identification
            className="animate-fade-in"
            style={{
              display: "flex",
              justifyContent:
                m.senderId === currentUserId ? "flex-end" : "flex-start",
              marginBottom: "var(--spacing-md)",
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius:
                  m.senderId === currentUserId
                    ? "var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)"
                    : "var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)",
                background:
                  m.senderId === currentUserId
                    ? "var(--gradient-primary)"
                    : "white",
                color: m.senderId === currentUserId ? "white" : "var(--dark)",
                boxShadow: "var(--shadow-sm)",
                position: "relative",
              }}
            >
              <div style={{ fontSize: "0.9rem" }}>{m.text}</div>
              <div
                style={{
                  fontSize: "0.7rem",
                  marginTop: "var(--spacing-xs)",
                  opacity: 0.8,
                  textAlign: "right",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {m.senderId === currentUserId && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color:
                        m.status === "read"
                          ? "var(--read)"
                          : m.status === "delivered"
                          ? "var(--delivered)"
                          : "var(--sent)",
                    }}
                  >
                    {m.status === "read"
                      ? "✓✓"
                      : m.status === "delivered"
                      ? "✓✓"
                      : "✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      {typingUsers.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
            padding: "var(--spacing-sm) var(--spacing-md)",
            fontStyle: "italic",
            color: "var(--gray)",
          }}
        >
          <div className="animate-pulse">
            {typingUsers.join(", ")} is typing
          </div>
          <div
            className="animate-fade-in-out"
            style={{ color: "var(--primary)" }}
          >
            ...
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
