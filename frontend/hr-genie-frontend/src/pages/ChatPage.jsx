import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import ConversationList from '../components/chat/ConversationList';
import { Bot, Menu } from 'lucide-react';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await chatAPI.getConversationMessages(conversationId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (content) => {
    setLoading(true);
    
    const userMessage = {
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await chatAPI.sendMessage({
        conversation_id: activeConversation,
        message: content,
      });

      const newConversationId = response.data.conversation_id;
      
      if (!activeConversation) {
        setActiveConversation(newConversationId);
        await fetchConversations();
      }

      setMessages((prev) => [...prev, response.data.message]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (id) => {
    if (window.confirm('Delete this conversation?')) {
      try {
        await chatAPI.deleteConversation(id);
        if (activeConversation === id) {
          handleNewConversation();
        }
        await fetchConversations();
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      <div className="hidden lg:block w-80 rounded-xl overflow-hidden shadow-sm">
        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelect={(id) => setActiveConversation(id)}
          onDelete={handleDeleteConversation}
          onNew={handleNewConversation}
        />
      </div>

      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-80 z-50 animate-slideIn">
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelect={(id) => {
                setActiveConversation(id);
                setSidebarOpen(false);
              }}
              onDelete={handleDeleteConversation}
              onNew={handleNewConversation}
            />
          </div>
        </>
      )}

      <div className="flex-1 card p-0 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">HR Assistant</h2>
            <p className="text-sm text-gray-500">Ask me anything about HR</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-12 h-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to HR Genie!
                </h3>
                <p className="text-gray-600 mb-6">
                  I'm your AI assistant. I can help you with HR policies, leave requests, 
                  benefits information, and more.
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-sm text-gray-500 font-medium">Try asking:</p>
                  <div className="space-y-2">
                    {[
                      "What's the sick leave policy?",
                      "How many vacation days do I have?",
                      "I need leave from Dec 20-27",
                      "Tell me about remote work policy"
                    ].map((example, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(example)}
                        className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <ChatInput onSend={handleSendMessage} loading={loading} />
      </div>
    </div>
  );
};

export default ChatPage;