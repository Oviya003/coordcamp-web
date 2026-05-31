import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../config/supabase';

export default function ChatbotPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I'm your CoordCamp AI Assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      let botResponse = "I'm not entirely sure! Try asking me about upcoming events or active clubs.";
      const lowerInput = userMessage.text.toLowerCase();

      // Extract a potential search term by removing common words
      const words = lowerInput.replace(/[.,?]/g, '').split(' ');
      const stopWords = ['say', 'tell', 'about', 'show', 'me', 'the', 'a', 'an', 'is', 'there', 'any', 'find', 'search', 'club', 'clubs', 'event', 'events'];
      const searchWord = words.find(w => !stopWords.includes(w) && w.length > 2) || '';

      if (lowerInput.includes('credits') || lowerInput.includes('points')) {
        botResponse = `You currently have **${user?.credits || 0} credits** in your account. You can earn more by checking into events using GPS or QR codes!`;
      } 
      else if (lowerInput.includes('club') || lowerInput.includes('society')) {
        let query = supabase.from('clubs').select('name, description, category').limit(3);
        if (searchWord) {
            query = query.or(`name.ilike.%${searchWord}%,description.ilike.%${searchWord}%`);
        }
        const { data } = await query;
        if (data && data.length > 0) {
            botResponse = `Here is what I found in our database:\n\n` + data.map(c => `**${c.name}** (${c.category})\n${c.description}`).join('\n\n---\n');
        } else {
            botResponse = `I couldn't find any specific clubs matching "${searchWord}". We have many other active student organizations though! Check the Clubs tab.`;
        }
      } 
      else if (lowerInput.includes('event') || lowerInput.includes('happening') || lowerInput.includes('upcoming')) {
        let query = supabase.from('events').select('title, date, location, category').gte('date', new Date().toISOString()).order('date', { ascending: true }).limit(3);
        if (searchWord) {
            query = query.or(`title.ilike.%${searchWord}%,description.ilike.%${searchWord}%`);
        }
        const { data } = await query;
        if (data && data.length > 0) {
            botResponse = `I checked the live campus calendar. Here are the upcoming events:\n\n` + data.map(e => `🎉 **${e.title}**\n📍 ${e.location}\n📅 ${new Date(e.date).toLocaleDateString()} at ${new Date(e.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`).join('\n\n');
        } else {
            botResponse = `There don't seem to be any upcoming events matching "${searchWord}" right now. Check the Events tab for the full calendar!`;
        }
      } 
      else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        botResponse = "Hi there! I can scan the database to help you find upcoming events or active clubs. Try asking 'Tell me about music clubs' or 'Show upcoming events'.";
      }

      // Add a slight delay to feel like an AI is "thinking"
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: botResponse }]);
      }, 1000);
      
    } catch (error) {
       setIsTyping(false);
       setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: "Sorry, I'm having trouble connecting to the university database right now." }]);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      
      <div className="bg-cc-navy p-6 flex items-center gap-4 text-white">
        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
          <Bot size={28} className="text-cc-gold" />
        </div>
        <div>
          <h2 className="text-xl font-playfair font-bold">CoordCamp AI Assistant</h2>
          <p className="text-sm text-gray-300">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.type === 'user' ? 'bg-cc-maroon text-white' : 'bg-cc-gold text-cc-navy'
              }`}>
                {msg.type === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.type === 'user' 
                  ? 'bg-cc-maroon text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-cc-navy rounded-tl-none shadow-sm'
              }`}>
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-10 h-10 rounded-full bg-cc-gold text-cc-navy flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-cc-navy" size={20} />
                <span className="text-sm text-gray-500 font-semibold">Generating response...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 space-y-3">
        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setInput("How do I check in for attendance?")} className="shrink-0 bg-gray-100 text-cc-navy px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition">Attendance Help</button>
            <button onClick={() => setInput("What events are happening this week?")} className="shrink-0 bg-gray-100 text-cc-navy px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition">Event Recommendations</button>
            <button onClick={() => setInput("Suggest some tech clubs to join.")} className="shrink-0 bg-gray-100 text-cc-navy px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition">Club Suggestions</button>
            <button onClick={() => setInput("Explain the dashboard features.")} className="shrink-0 bg-gray-100 text-cc-navy px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition">Dashboard Help</button>
          </div>
        )}
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about CoordCamp..."
            className="w-full pl-6 pr-16 py-4 rounded-full border border-gray-200 bg-cc-offwhite focus:border-cc-gold focus:ring-2 focus:ring-yellow-50 outline-none transition"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-cc-navy text-white p-3 rounded-full hover:bg-opacity-90 transition disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

    </div>
  );
}
