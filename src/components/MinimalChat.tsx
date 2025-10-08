import React, { useState } from 'react';

export default function MinimalChat() {
  const [messages, setMessages] = useState(['Hello! I am your insurance assistant.']);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, `You: ${input}`, 'Assistant: I received your message!']);
      setInput('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Minimal Chat</h2>
      
      <div className="h-64 overflow-y-auto border p-4 mb-4 bg-gray-50 rounded">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">{msg}</div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
