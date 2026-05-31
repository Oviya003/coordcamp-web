import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MessageBubble({ message }) {
  const isBot = message.isBot;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${isBot ? 'bg-white border border-gray-200 shadow-sm' : 'bg-cc-navy text-white'}`}>
        {isBot ? <img src="/logo.png" alt="AI" className="w-5 h-5 object-contain" /> : <User size={16} />}
      </div>
      
      <div className={`p-3 rounded-2xl text-sm ${isBot ? 'bg-gray-100 text-gray-800 rounded-tl-none' : 'bg-cc-maroon text-white rounded-tr-none'}`}>
        {/* In Phase 2, this can be swapped with react-markdown */}
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </motion.div>
  );
}
