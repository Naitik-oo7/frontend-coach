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
    <div className="overflow-y-auto">
      {conversations.map((c) => (
        <div
          key={c.conversationId}
          onClick={() => onSelect(c.conversationId)}
          className={`${
            c.conversationId === activeId ? "bg-white" : ""
          } p-4 cursor-pointer font-normal border-b border-slate-200 transition-all duration-200 relative flex items-center gap-3 hover:bg-slate-50`}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-white bg-indigo-600">
            {c.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium truncate">{c.user.name}</div>
              {c.unread && (
                <div className="px-2 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium">
                  New
                </div>
              )}
            </div>
            <div className="text-sm text-slate-500 truncate">
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
