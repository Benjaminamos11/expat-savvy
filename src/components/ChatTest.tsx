import React, { useState } from 'react';

export default function ChatTest() {
  const [message, setMessage] = useState('');

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Simple Chat Test</h2>
      <input 
        type="text" 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type something..."
        className="w-full p-2 border rounded"
      />
      <p className="mt-2">You typed: {message}</p>
    </div>
  );
}
