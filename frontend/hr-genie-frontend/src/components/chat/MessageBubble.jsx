import React from 'react';
import { Bot, User, CheckCircle } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isFunction = message.function_call;

  if (isFunction) {
    const functionData = typeof message.function_call === 'string' 
      ? JSON.parse(message.function_call) 
      : message.function_call;

    return (
      <div className="flex items-center justify-center my-4">
        <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary-600" />
          <span className="text-sm text-primary-700">
            Action: {functionData.name.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary-600" />
        </div>
      )}
      
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-2 ${isUser ? 'text-primary-100' : 'text-gray-400'}`}>
          {new Date(message.created_at).toLocaleTimeString('en', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;