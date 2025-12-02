// src/pages/ChatPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiGet } from "../api/client";
import MessageInput from "../components/MessageInput";
import { io, Socket } from "socket.io-client";
import type { Conversation } from "../components/ConversationList";
import type { Message } from "../components/MessageList";
import ConversationList from "../components/ConversationList";
import MessageList from "../components/MessageList";

const ChatPage: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // connect socket
  useEffect(() => {
    if (!accessToken) return;

    const socket = io("http://localhost:3000", {
      auth: { token: accessToken },
    });

    socket.on("connect", () => {
      console.log("✅ socket connected");
    });

    socket.on("messageSent", (msg: any) => {
      if (msg.conversationId === activeId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("newPrivateMessage", (msg: any) => {
      if (msg.conversationId === activeId) {
        setMessages((prev) => [...prev, msg]);
      }
      loadConversations(); // refresh unread
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, activeId]);

  const loadConversations = async () => {
    const res = await apiGet("/chat/conversations");
    setConversations(res.data);
  };

  const loadMessages = async (conversationId: string) => {
    const res = await apiGet(`/chat/conversations/${conversationId}/messages`);
    setMessages(res.data);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectConversation = async (id: string) => {
    setActiveId(id);
    await loadMessages(id);
  };

  const handleSend = (text: string) => {
    if (!activeId || !socketRef.current) return;
    socketRef.current.emit("privateMessage", {
      conversationId: activeId,
      text,
    });
  };

  if (!user) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ width: "30%" }}>
        <h3>
          {user.name}{" "}
          <button onClick={logout} style={{ marginLeft: 8 }}>
            Logout
          </button>
        </h3>
        <h4>Conversations</h4>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelectConversation}
        />
      </div>

      <div style={{ width: "70%" }}>
        <h3>Chat</h3>
        {activeId ? (
          <>
            <MessageList messages={messages} currentUserId={user.id} />
            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <p>Select a conversation.</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
