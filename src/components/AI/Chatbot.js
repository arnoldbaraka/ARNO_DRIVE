import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../utils/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { analyzeSentiment } from '../../services/aiService';
import './Chatbot.css';

export default function AIChatbot({ driverId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, `drivers/${driverId}/chats`),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = [];
      snapshot.forEach(doc => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages);
    });

    return unsubscribe;
  }, [driverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const user = auth.currentUser;
    const userMessage = {
      text: input,
      userId: user.uid,
      name: user.displayName,
      timestamp: serverTimestamp(),
      type: 'user'
    };

    await addDoc(collection(db, `drivers/${driverId}/chats`), userMessage);
    
    // Get AI response
    setIsTyping(true);
    const sentiment = await analyzeSentiment(input);
    const aiResponse = await generateAIResponse(input, sentiment, driverId);
    
    // Add AI response
    await addDoc(collection(db, `drivers/${driverId}/chats`), {
      text: aiResponse,
      name: 'ARNO AI',
      timestamp: serverTimestamp(),
      type: 'ai',
      sentiment
    });
    
    setIsTyping(false);
    setInput('');
  };

  return (
    <div className="holographic-chat">
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <div className="message-header">
              <span className="sender">{msg.name}</span>
              {msg.sentiment && (
                <span className={`sentiment ${msg.sentiment}`}>
                  {msg.sentiment}
                </span>
              )}
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="message ai">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your driver..."
        />
        <button type="submit" className="holographic-btn">
          <i className="icon-send"></i>
        </button>
      </form>
    </div>
  );
}

async function generateAIResponse(message, sentiment, driverId) {
  // This would call a cloud function in production
  const responses = {
    positive: [
      "That's great to hear! Our driver appreciates your support!",
      "Awesome! Your driver will be thrilled to hear this feedback.",
      "Positive vibes! The driver will love this message."
    ],
    neutral: [
      "Thanks for your message! The driver will respond when possible.",
      "Message received! Your driver will see this soon.",
      "Your support means a lot to our drivers!"
    ],
    negative: [
      "We're sorry to hear that. Your feedback is important to us.",
      "Thank you for sharing your concerns. We'll address this.",
      "We appreciate your honesty and will work to improve."
    ]
  };
  
  const randomResponse = responses[sentiment][
    Math.floor(Math.random() * responses[sentiment].length)
  ];
  
  return `${randomResponse} (AI: ${sentiment} sentiment detected)`;
}