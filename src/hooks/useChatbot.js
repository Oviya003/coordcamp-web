import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';

export function useChatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm the CoordCamp AI Assistant. How can I help you today?", isBot: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Create a placeholder for the bot's response
    const botMsgId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botMsgId, text: '', isBot: true }]);

    try {
      // Use streaming simulation
      const stream = aiService.streamMessage(text);
      let currentText = '';

      for await (const chunk of stream) {
        currentText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: currentText } : msg
          )
        );
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: "Sorry, I'm having trouble connecting right now." } : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, []);

  return {
    messages,
    isTyping,
    sendMessage
  };
}
