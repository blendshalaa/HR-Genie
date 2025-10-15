import React from 'react';
import { MessageSquare, Trash2, Plus } from 'lucide-react';

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  onSelect, 
  onDelete, 
  onNew 
}) => {
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNew}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                activeConversation === conv.id
                  ? 'bg-primary-50 border border-primary-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  activeConversation === conv.id ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conv.title}
                  </p>
                  {conv.last_message && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conv.last_message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.last_message_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;