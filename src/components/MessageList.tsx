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

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "read":
        return "text-indigo-600";
      case "delivered":
        return "text-slate-500";
      case "sent":
        return "text-slate-400";
      default:
        return "text-slate-400";
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "read":
        return "✓✓";
      case "delivered":
        return "✓✓";
      case "sent":
        return "✓";
      default:
        return "✓";
    }
  };

  return (
    <div
      id="messages"
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-2 sm:p-4 mb-2 bg-white"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No messages yet</h3>
          <p className="text-sm mt-1">
            Be the first to start the conversation!
          </p>
        </div>
      ) : (
        messages.map((m, index) => (
          <div
            key={m.id}
            data-message-id={m.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div
              className={`w-fit max-w-[85%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg shadow-sm relative message-bubble ${
                m.senderId === currentUserId
                  ? "ml-auto bg-indigo-600 text-white rounded-tr-none rounded-tl-xl rounded-br-xl rounded-bl-xl"
                  : "mr-auto bg-slate-100 text-slate-800 rounded-tr-xl rounded-tl-none rounded-br-xl rounded-bl-xl border border-slate-200"
              }`}
            >
              <div className="text-sm">{m.text}</div>
              <div className="text-xs mt-1 opacity-80 text-right flex justify-end items-center gap-1">
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {m.senderId === currentUserId && (
                  <span className={getStatusColor(m.status)}>
                    {getStatusIcon(m.status)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 p-2 text-slate-500 text-sm">
          <div>{typingUsers.join(", ")} is typing</div>
          <div className="typing-indicator text-slate-400"></div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
