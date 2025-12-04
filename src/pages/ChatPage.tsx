// src/pages/ChatPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiGet, apiPost } from "../api/client";
import MessageInput from "../components/MessageInput";
import { io, Socket } from "socket.io-client";
import type { Conversation } from "../components/ConversationList";
import type { Message } from "../components/MessageList";
import ConversationList from "../components/ConversationList";
import MessageList from "../components/MessageList";
import { useToast } from "../hooks/useToast";

// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
}

// Define API response interfaces
interface ConversationsResponse {
  data: Conversation[];
}

interface UsersResponse {
  data: User[];
}

interface MessagesResponse {
  data: Message[];
}

interface CreateConversationResponse {
  data?: {
    conversationId?: string;
    id?: string;
  };
  conversationId?: string;
  id?: string;
}

const ChatPage: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
  const toast = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newConversationUserId, setNewConversationUserId] = useState("");
  const [showNewConversationForm, setShowNewConversationForm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // connect socket
  useEffect(() => {
    if (!accessToken) return;

    const socket = io("http://localhost:3005", {
      auth: { token: accessToken },
    });

    socket.on("connect", () => {
      console.log("✅ socket connected");
    });

    socket.on("tokenExpired", () => {
      console.log("Token expired, logging out...");
      // Token has expired, log the user out
      logout();
      toast.error("Your session has expired. Please log in again.");
    });

    socket.on("messageSent", (msg: Message) => {
      if (msg.conversationId === activeId) {
        setMessages((prev) => [...prev, { ...msg, status: "sent" }]);
      }
    });

    socket.on("newPrivateMessage", (msg: Message) => {
      if (msg.conversationId === activeId) {
        setMessages((prev) => [...prev, msg]);

        // Also update the message status locally
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, status: msg.status || "delivered" } : m
          )
        );
      }

      // Update conversations to show unread indicator
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === msg.conversationId
            ? { ...conv, unread: true }
            : conv
        )
      );
    });

    socket.on(
      "messageStatusUpdated",
      (data: {
        messageId?: string;
        messageIds?: string[];
        status: "sent" | "delivered" | "read";
      }) => {
        // Handle both single message and multiple messages
        if (data.messageId) {
          // Single message format (backward compatibility)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId ? { ...msg, status: data.status } : msg
            )
          );
        } else if (data.messageIds) {
          // Multiple messages format (new format)
          setMessages((prev) =>
            prev.map((msg) =>
              data.messageIds!.includes(msg.id)
                ? { ...msg, status: data.status }
                : msg
            )
          );
        }

        // If this is a read status update, we might want to refresh conversations
        // to update any unread indicators
        if (data.status === "read") {
          loadConversations();
        }
      }
    );

    // Handle typing indicators
    socket.on("typing", (data: { userId: string }) => {
      // Add user to typing list
      setTypingUsers((prev) => [...new Set([...prev, data.userId])]);
    });

    // Handle stop typing indicators
    socket.on("stopTyping", (data: { userId: string }) => {
      // Remove user from typing list
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, activeId]);

  const loadConversations = async () => {
    try {
      const res = await apiGet<ConversationsResponse>(
        "/api/v1/chat/conversations"
      );
      console.log("Conversations loaded:", res);
      setConversations(res.data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load conversations");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await apiGet<UsersResponse>("/api/v1/users");
      console.log("Users loaded:", res);
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await apiGet<MessagesResponse>(
        `/api/v1/chat/conversations/${conversationId}/messages`
      );
      console.log(`Messages loaded for conversation ${conversationId}:`, res);
      setMessages(res.data);
    } catch (error) {
      console.error(
        `Failed to load messages for conversation ${conversationId}:`,
        error
      );
      toast.error(`Failed to load messages: ${(error as Error).message}`);
    }
  };

  const createConversation = async (userId: string) => {
    try {
      console.log("Creating conversation with user ID:", userId);
      const res = await apiPost<CreateConversationResponse>(
        "/api/v1/chat/conversations",
        { userId }
      );
      console.log("Response from create conversation:", res);

      // Check if response has the expected structure
      if (!res) {
        throw new Error("Invalid response from server");
      }

      // Handle different possible response structures
      let conversationData;
      if (res.data) {
        conversationData = res.data;
      } else {
        // If there's no data property, assume the response itself is the data
        conversationData = res;
      }

      // Extract conversation ID from various possible locations
      let conversationId;
      if (conversationData.conversationId) {
        conversationId = conversationData.conversationId;
      } else if (conversationData.id) {
        conversationId = conversationData.id;
      } else {
        // If we can't find a conversation ID, create a temporary one
        conversationId = `temp_${Date.now()}`;
        console.warn(
          "Could not find conversation ID in response, using temporary ID:",
          conversationId
        );
      }

      // Create a new conversation object with the proper structure
      const newConversation: Conversation = {
        conversationId: conversationId,
        lastMessageAt: null,
        unread: false,
        user: users.find((u) => u.id === userId) || {
          id: userId,
          name: "Unknown User",
          email: "",
        },
      };

      setConversations((prev) => [...prev, newConversation]);
      // Select the new conversation
      handleSelectConversation(conversationId);
      // Hide the form
      setShowNewConversationForm(false);
      setNewConversationUserId("");

      toast.success("Conversation created successfully!");
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to create conversation: " + (error as Error).message);
    }
  };

  useEffect(() => {
    loadConversations();
    loadUsers();
  }, []);

  const handleSelectConversation = async (id: string) => {
    console.log("Selected conversation:", id);

    // Immediately update local state to mark conversation as read
    setConversations((prev) =>
      prev.map((conv) =>
        conv.conversationId === id ? { ...conv, unread: false } : conv
      )
    );

    setActiveId(id);
    await loadMessages(id);

    // Mark messages as read when conversation is opened
    if (socketRef.current) {
      socketRef.current.emit("markMessagesAsRead", id);
    }
  };

  const handleSend = (text: string) => {
    if (!activeId || !socketRef.current) return;

    // Emit the message
    socketRef.current.emit("privateMessage", {
      conversationId: activeId,
      text,
    });
  };

  // Add this new function to handle marking messages as read when they're viewed
  const handleMessagesViewed = (messageIds: string[]) => {
    if (!activeId || !socketRef.current) return;

    // Emit an event to mark these messages as read
    socketRef.current.emit("markMessagesAsReadByIds", {
      conversationId: activeId,
      messageIds: messageIds,
    });
  };

  // Send typing indicator
  const sendTypingIndicator = () => {
    if (!activeId || !socketRef.current || !user) return;
    socketRef.current.emit("typing", {
      conversationId: activeId,
      userId: user.id,
    });
  };

  // Send stop typing indicator
  const sendStopTypingIndicator = () => {
    if (!activeId || !socketRef.current || !user) return;
    socketRef.current.emit("stopTyping", {
      conversationId: activeId,
      userId: user.id,
    });
  };

  const handleCreateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConversationUserId.trim()) {
      createConversation(newConversationUserId.trim());
    }
  };

  if (!user) return null;

  return (
    <div className="p-4">
      <div className="flex flex-col h-[calc(100vh-2rem)] rounded-lg overflow-hidden shadow-md border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white text-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-medium text-indigo-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="m-0 text-lg font-medium">Chat App</h2>
              <p className="m-0 text-slate-600 text-sm">
                Welcome, {user.name}!
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Show Admin Panel link only for admin users */}
            {user.role === "admin" && (
              <a
                href="/admin/permissions"
                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md no-underline flex items-center hover:bg-slate-200 transition"
              >
                Admin Panel
              </a>
            )}
            <button
              className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-slate-200 flex flex-col bg-white">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="m-0 font-medium text-slate-800">Conversations</h3>
              <div className="flex gap-1">
                <button
                  className="px-3 py-1 text-sm min-w-[36px] bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  ?
                </button>
                <button
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                  onClick={() =>
                    setShowNewConversationForm(!showNewConversationForm)
                  }
                >
                  +
                </button>
              </div>
            </div>

            {showHelp && (
              <div className="m-4 p-4 bg-white rounded-md shadow-sm border border-slate-200">
                <h4 className="mt-0 text-base font-medium text-slate-800">
                  How to use conversations
                </h4>
                <ul className="pl-5 mb-0 text-sm text-slate-600">
                  <li className="mb-1">
                    To start a new conversation, click the "+" button
                  </li>
                  <li className="mb-1">
                    Select a user from the list or enter their User ID
                  </li>
                  <li>Click on a conversation to view and send messages</li>
                </ul>
              </div>
            )}

            {showNewConversationForm && (
              <div className="m-4 p-4 bg-white rounded-md shadow-sm border border-slate-200">
                <h4 className="mt-0 text-base font-medium text-slate-800">
                  Start New Conversation
                </h4>
                <form onSubmit={handleCreateConversation}>
                  <input
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                    type="text"
                    placeholder="Enter user ID"
                    value={newConversationUserId}
                    onChange={(e) => setNewConversationUserId(e.target.value)}
                  />
                  <button
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    type="submit"
                  >
                    Start Conversation
                  </button>
                </form>

                {users.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-2">Select from all users:</h5>
                    <div className="max-h-[150px] overflow-y-auto">
                      {users
                        .filter((u) => u.id !== user.id) // Don't show current user
                        .map((u: User) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              setNewConversationUserId(u.id);
                              createConversation(u.id);
                            }}
                            className="p-2 cursor-pointer bg-slate-50 rounded-md mb-1 transition hover:bg-slate-100"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-medium text-white text-xs">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{u.name}</div>
                                <div className="text-xs text-slate-500">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center p-8 text-slate-600">
                  <p>No conversations yet. Start a new conversation!</p>
                  <button
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    onClick={() => setShowNewConversationForm(true)}
                  >
                    Start New Conversation
                  </button>
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  activeId={activeId}
                  onSelect={handleSelectConversation}
                />
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="w-2/3 flex flex-col">
            {activeId ? (
              <>
                <MessageList
                  messages={messages}
                  currentUserId={user.id}
                  typingUsers={typingUsers}
                  onMessagesViewed={handleMessagesViewed}
                />
                <MessageInput
                  onSend={handleSend}
                  onTyping={sendTypingIndicator}
                  onStopTyping={sendStopTypingIndicator}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
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
                <h2 className="mb-2 text-slate-800">Welcome to Chat App!</h2>
                <p className="mb-6 text-slate-600 max-w-md">
                  Select a conversation from the list or start a new one to
                  begin chatting with your friends.
                </p>
                <button
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                  onClick={() => setShowNewConversationForm(true)}
                >
                  Start New Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
