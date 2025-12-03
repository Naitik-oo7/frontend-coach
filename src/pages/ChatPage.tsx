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

// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
}

const ChatPage: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
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
      alert("Your session has expired. Please log in again.");
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

      // Remove user from typing list after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
      }, 3000);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, activeId]);

  const loadConversations = async () => {
    try {
      const res = await apiGet("/api/v1/chat/conversations");
      console.log("Conversations loaded:", res);
      setConversations(res.data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await apiGet("/api/v1/users");
      console.log("Users loaded:", res);
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await apiGet(
        `/api/v1/chat/conversations/${conversationId}/messages`
      );
      console.log(`Messages loaded for conversation ${conversationId}:`, res);
      setMessages(res.data);
    } catch (error) {
      console.error(
        `Failed to load messages for conversation ${conversationId}:`,
        error
      );
    }
  };

  const createConversation = async (userId: string) => {
    try {
      console.log("Creating conversation with user ID:", userId);
      const res = await apiPost("/api/v1/chat/conversations", { userId });
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
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to create conversation: " + (error as Error).message);
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

  const handleCreateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConversationUserId.trim()) {
      createConversation(newConversationUserId.trim());
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: "var(--spacing-lg) 0" }}>
      <div
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 2 * var(--spacing-lg))",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--spacing-md) var(--spacing-lg)",
            borderBottom: "1px solid #eee",
            background:
              "linear-gradient(135deg, var(--primary), var(--secondary))",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-md)",
            }}
          >
            <div
              className="avatar avatar-lg"
              style={{
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Chat App</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>
                Welcome, {user.name}!
              </p>
            </div>
          </div>
          <button
            className="btn"
            onClick={logout}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <div
            style={{
              width: "30%",
              borderRight: "1px solid #eee",
              display: "flex",
              flexDirection: "column",
              background: "#f9f9fc",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--spacing-md)",
                borderBottom: "1px solid #eee",
              }}
            >
              <h3 style={{ margin: 0 }}>Conversations</h3>
              <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                <button
                  className="btn"
                  onClick={() => setShowHelp(!showHelp)}
                  style={{
                    padding: "var(--spacing-xs) var(--spacing-sm)",
                    fontSize: "0.9rem",
                    minWidth: "36px",
                  }}
                >
                  ?
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setShowNewConversationForm(!showNewConversationForm)
                  }
                  style={{
                    padding: "var(--spacing-xs) var(--spacing-sm)",
                    fontSize: "0.9rem",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {showHelp && (
              <div
                className="card"
                style={{
                  margin: "var(--spacing-md)",
                  padding: "var(--spacing-md)",
                  backgroundColor: "white",
                }}
              >
                <h4 style={{ marginTop: 0, fontSize: "1.1rem" }}>
                  How to use conversations
                </h4>
                <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                  <li style={{ marginBottom: "var(--spacing-xs)" }}>
                    To start a new conversation, click the "+" button
                  </li>
                  <li style={{ marginBottom: "var(--spacing-xs)" }}>
                    Select a user from the list or enter their User ID
                  </li>
                  <li>Click on a conversation to view and send messages</li>
                </ul>
              </div>
            )}

            {showNewConversationForm && (
              <div
                className="card"
                style={{
                  margin: "var(--spacing-md)",
                  padding: "var(--spacing-md)",
                  backgroundColor: "white",
                }}
              >
                <h4 style={{ marginTop: 0, fontSize: "1.1rem" }}>
                  Start New Conversation
                </h4>
                <form onSubmit={handleCreateConversation}>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Enter user ID"
                    value={newConversationUserId}
                    onChange={(e) => setNewConversationUserId(e.target.value)}
                    style={{ marginBottom: "var(--spacing-sm)" }}
                  />
                  <button
                    className="btn btn-primary"
                    type="submit"
                    style={{ width: "100%" }}
                  >
                    Start Conversation
                  </button>
                </form>

                {users.length > 0 && (
                  <div style={{ marginTop: "var(--spacing-md)" }}>
                    <h5 style={{ marginBottom: "var(--spacing-sm)" }}>
                      Select from all users:
                    </h5>
                    <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                      {users
                        .filter((u) => u.id !== user.id) // Don't show current user
                        .map((u: User) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              setNewConversationUserId(u.id);
                              createConversation(u.id);
                            }}
                            style={{
                              padding: "var(--spacing-sm)",
                              cursor: "pointer",
                              borderBottom: "1px solid #eee",
                              backgroundColor: "#f9f9f9",
                              borderRadius: "var(--radius-sm)",
                              marginBottom: "var(--spacing-xs)",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e9e9f9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f9f9f9")
                            }
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--spacing-sm)",
                              }}
                            >
                              <div
                                className="avatar avatar-sm"
                                style={{
                                  backgroundColor: "var(--primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  color: "white",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 500 }}>{u.name}</div>
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--gray)",
                                  }}
                                >
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

            <div style={{ flex: 1, overflowY: "auto" }}>
              {conversations.length === 0 ? (
                <div
                  style={{ textAlign: "center", padding: "var(--spacing-xl)" }}
                >
                  <p>No conversations yet. Start a new conversation!</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowNewConversationForm(true)}
                    style={{ marginTop: "var(--spacing-md)" }}
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
          <div
            style={{ width: "70%", display: "flex", flexDirection: "column" }}
          >
            {activeId ? (
              <>
                <MessageList
                  messages={messages}
                  currentUserId={user.id}
                  typingUsers={typingUsers}
                  onMessagesViewed={handleMessagesViewed} // Add this prop
                />
                <MessageInput
                  onSend={handleSend}
                  onTyping={sendTypingIndicator}
                />
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "var(--spacing-xl)",
                  background: "linear-gradient(135deg, #f0f0f5, #e6e6f0)",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--spacing-lg)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <h2 style={{ marginBottom: "var(--spacing-sm)" }}>
                  Welcome to Chat App!
                </h2>
                <p
                  style={{
                    marginBottom: "var(--spacing-lg)",
                    color: "var(--gray)",
                    maxWidth: "400px",
                  }}
                >
                  Select a conversation from the list or start a new one to
                  begin chatting with your friends.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowNewConversationForm(true)}
                  style={{ padding: "var(--spacing-sm) var(--spacing-lg)" }}
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

/*
 * SOCKET-BASED DATA FETCHING FUNCTIONS (COMMENTED OUT)
 *
 * While it's technically possible to fetch chats and conversations via socket events,
 * this approach is not recommended for the following reasons:
 *
 * 1. Violates separation of concerns - REST APIs are designed for request-response patterns
 *    while sockets are designed for real-time, bidirectional communication
 *
 * 2. Increased complexity - Need to implement request-response matching with IDs,
 *    manual timeout handling, and more complex error handling
 *
 * 3. Loss of HTTP benefits - No caching, standardized status codes, or automatic retry mechanisms
 *
 * 4. Scalability issues - Keeping socket connections open for data fetching consumes more
 *    server resources compared to stateless REST APIs
 *
 * 5. Poor developer experience - Standard tools won't work, harder to test and debug
 *
 * We're using REST APIs for data fetching and sockets only for real-time updates,
 * which is the industry best practice for chat applications.
 */

/*
  // NEW: Function to fetch conversations via socket
  const fetchConversationsViaSocket = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error("Socket not connected"));
        return;
      }

      const requestId = Math.random().toString(36).substring(2, 15);
      requestCallbacksRef.current.set(requestId, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || "Failed to fetch conversations"));
        }
      });

      socketRef.current.emit("fetchConversations", { requestId });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (requestCallbacksRef.current.has(requestId)) {
          requestCallbacksRef.current.delete(requestId);
          reject(new Error("Request timeout"));
        }
      }, 10000);
    });
  };

  // NEW: Function to fetch messages via socket
  const fetchMessagesViaSocket = (conversationId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error("Socket not connected"));
        return;
      }

      const requestId = Math.random().toString(36).substring(2, 15);
      requestCallbacksRef.current.set(requestId, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || "Failed to fetch messages"));
        }
      });

      socketRef.current.emit("fetchMessages", { 
        requestId, 
        conversationId 
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (requestCallbacksRef.current.has(requestId)) {
          requestCallbacksRef.current.delete(requestId);
          reject(new Error("Request timeout"));
        }
      }, 10000);
    });
  };
  */

/*
  // Modified loadConversations using socket (commented out)
  const loadConversations = async () => {
    try {
      // Use socket instead of REST API
      const res = await fetchConversationsViaSocket();
      console.log("Conversations loaded via socket:", res);
      setConversations(res.data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  // Modified loadMessages using socket (commented out)
  const loadMessages = async (conversationId: string) => {
    try {
      // Use socket instead of REST API
      const res = await fetchMessagesViaSocket(conversationId);
      console.log(`Messages loaded via socket for conversation ${conversationId}:`, res);
      setMessages(res.data);
    } catch (error) {
      console.error(
        `Failed to load messages for conversation ${conversationId}:`,
        error
      );
    }
  };
  */
