import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatbot } from '../../hooks/useChatbot';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage } = useChatbot();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-[350px] sm:w-[400px] h-[500px] shadow-2xl rounded-2xl mb-4 flex flex-col border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-cc-navy text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-full shadow-sm">
                  <img src="/logo.png" alt="AI Avatar" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold">CoordCamp AI</h3>
                  <p className="text-xs text-white/70">Always here to help</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="flex gap-2 items-center self-start bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-100 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cc-maroon/20 focus:bg-white transition"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="bg-cc-maroon text-white p-3 rounded-xl hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-cc-navy' : 'bg-cc-maroon'} text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-200 flex items-center justify-center`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
