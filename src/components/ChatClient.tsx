import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `**🏥 Swiss Insurance Assistant**

Hi! I'm your Expat-Savvy insurance expert. Choose what you need help with:`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendChoiceMessage = (choice: string) => {
    let message = '';
    switch (choice) {
      case 'premium':
        message = 'I want to calculate health insurance premiums';
        break;
      case 'general':
        message = 'I have general health insurance questions';
        break;
      case 'legal':
        message = 'I need help with legal protection insurance';
        break;
      case '3rd-pillar':
        message = 'Tell me about 3rd pillar retirement savings';
        break;
      case 'comparison':
        message = 'I want to compare insurance providers';
        break;
    }
    sendMessage(message);
  };

  const getLoadingMessage = (userMessage: string) => {
    if (!userMessage || typeof userMessage !== 'string') {
      return 'Thinking...';
    }

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('premium') || lowerMessage.includes('calculate') || /\b\d{4}\b/.test(userMessage)) {
      return 'Calculating live premiums from Swiss insurers...';
    } else if (lowerMessage.includes('compare') || lowerMessage.includes('provider')) {
      return 'Comparing insurance options for you...';
    } else if (lowerMessage.includes('3rd pillar') || lowerMessage.includes('pillar 3')) {
      return 'Gathering 3rd pillar information...';
    } else {
      return 'Thinking...';
    }
  };

  const formatMessage = (content: string) => {
    try {
      let formatted = content || '';

      // Wrap insurance offers in styled boxes (before button conversion)
      // Pattern: **1. InsurerName**⭐ (or without star) followed by model, premium, buttons
      formatted = formatted.replace(
        /(\*\*\d+\.\s+[^\*]+\*\*[⭐]?.*?)(?=\*\*\d+\.|$)/gs,
        (match) => {
          // Only wrap if it contains premium information
          if (match.includes('Premium:') && match.includes('[Get Rate Button]')) {
            return '<div class="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 my-3 shadow-md hover:shadow-lg transition-shadow duration-200">' + match + '</div>';
          }
          return match;
        }
      );

      // Convert [Get Rate Button] [Get Consultation Button] to styled buttons
      formatted = formatted.replace(
        /\[Get Rate Button\]\s*\[Get Consultation Button\]/gi,
        '<div class="flex gap-2 mt-2 mb-3">' +
        '<button class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200">📧 Book Session</button>' +
        '<a href="https://cal.com/robertkolar/expat-savvy" class="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow text-center transition-all duration-200" target="_blank" rel="noopener">📅 Consult</a>' +
        '</div>'
      );

      // Convert Cal.com links to buttons
      formatted = formatted.replace(
        /Book via Cal\.com:\s*(https:\/\/cal\.com\/[^\s]+)/gi,
        '<a href="$1" class="inline-block mt-3 mb-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200" target="_blank" rel="noopener">📅 Book Free Consultation</a>'
      );

      // Convert Cal.com markdown links to buttons
      formatted = formatted.replace(
        /\[Book via Cal\.com\]\((https:\/\/cal\.com\/[^)]+)\)/gi,
        '<a href="$1" class="inline-block mt-3 mb-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200" target="_blank" rel="noopener">📅 Book Free Consultation</a>'
      );

      // Convert WhatsApp links to buttons
      formatted = formatted.replace(
        /WhatsApp:\s*(\+41\s*\d+(?:\s*\d+)*)/gi,
        (match, phone) => {
          const cleanPhone = phone.replace(/\s+/g, '');
          return `<a href="https://wa.me/${cleanPhone}" class="inline-block mt-2 mb-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200" target="_blank" rel="noopener">💬 WhatsApp Robert</a>`;
        }
      );

      // Bold headers with emojis
      formatted = formatted
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-bold">$1</strong>')

        // Bullet points
        .replace(/^- (.*$)/gim, '<span class="flex items-start mb-1"><span class="text-red-500 font-bold mr-2">•</span><span class="text-gray-700">$1</span></span>')

        // CHF amounts - subtle gray
        .replace(/(CHF\s*[\d,.']+(?:\/month)?)/gi, '<span class="font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">$1</span>')

        // Insurer names - red text
        .replace(/\*\*(Helsana|CSS|Swica|Sanitas|Visana|Sympany|KPT|Concordia|Assura|Groupe Mutuel|Atupri|Vivao|Galenos|Provisio|Sanagate)\*\*/g, '<strong class="text-red-800">$1</strong>')

        // Remove standalone "or" between buttons
        .replace(/(<\/a>)\s*or\s*(<a href)/gi, '$1 $2')

        // Horizontal lines to styled dividers
        .replace(/^---$/gm, '<div class="border-t border-gray-200 my-3"></div>')

        // Line breaks
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');

      return formatted;
    } catch (error) {
      console.error('Error formatting message:', error);
      return content || 'Error displaying message';
    }
  };

  const resetConversation = () => {
    setConversationId(null);
    setMessages([{
      id: 'welcome-reset',
      role: 'assistant',
      content: `**🔄 New Conversation Started**

Hi again! I'm ready to help with your Swiss insurance questions.

**👉 What can I help you with?**`,
      timestamp: new Date()
    }]);
  };

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(messageToSend);
    setInputMessage('');
    setIsLoading(true);

    // Check for premium calculation and auto-reset if needed
    const isPremiumQuery = messageToSend && typeof messageToSend === 'string' ? /(\b\d{4}\b|\bage\s*\d+|\d+\s*years?).*(\b\d{3,4}\b|\bdeductible|\bfranchise)/.test(messageToSend.toLowerCase()) : false;
    if (isPremiumQuery && messages.length > 2) {
      setConversationId(null);
    }

    try {
      const response = await fetch(`/api/agent_json?nocache=${Date.now()}&v=${Math.random()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userInput: messageToSend,
          conversationId: conversationId
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.message) {
        throw new Error('Invalid response from server');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m sorry, I encountered an error. Please try again or refresh the page.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Swiss Insurance Assistant</h3>
                <p className="text-red-100 text-sm">Powered by Expat-Savvy AI</p>
              </div>
            </div>
            <button
              onClick={resetConversation}
              className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-colors"
              title="Reset conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={messagesEndRef}
          className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${message.role === 'user'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                    : 'bg-white border border-gray-100'
                  }`}>
                  {message.role === 'assistant' ? (
                    <div className="text-sm text-gray-800 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                    </div>
                  ) : (
                    <p className="text-sm text-white">{message.content}</p>
                  )}
                </div>
              </div>

              {/* Choice buttons for welcome message */}
              {message.id === 'welcome' && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                  <button
                    onClick={() => sendChoiceMessage('premium')}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    💰 Start Free Assessment
                  </button>
                  <button
                    onClick={() => sendChoiceMessage('general')}
                    className="bg-white border-2 border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    🏥 Health Insurance
                  </button>
                  <button
                    onClick={() => sendChoiceMessage('legal')}
                    className="bg-white border-2 border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    ⚖️ Legal Protection
                  </button>
                  <button
                    onClick={() => sendChoiceMessage('3rd-pillar')}
                    className="bg-white border-2 border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    🏦 3rd Pillar Savings
                  </button>
                  <button
                    onClick={() => sendChoiceMessage('comparison')}
                    className="bg-white border-2 border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium col-span-1 sm:col-span-2"
                  >
                    📊 Compare Providers
                  </button>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl shadow-md max-w-xs">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                  <span className="text-sm">{getLoadingMessage(lastUserMessage)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div />
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about health insurance, premiums, or coverage..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none shadow-sm"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <button
              onClick={resetConversation}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
