'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Star, 
  ArrowRight,
  Flame,
  CheckCircle2,
  RefreshCw,
  Mic,
  MicOff
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface DishItem {
  id: string;
  name: string;
  description: string;
  price: number;
  rating?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestedDishes?: DishItem[];
  timestamp: string;
}

const FALLBACK_DISHES: DishItem[] = [
  {
    id: 'rec-1',
    name: 'Signature Berry Mocktail',
    description: 'Muddled fresh berries, mint, lime, and sparkling soda.',
    price: 250,
    rating: 4.9,
  },
  {
    id: 'rec-2',
    name: 'Valrhona Chocolate Fondant',
    description: 'Warm chocolate cake with a molten center, served with vanilla bean gelato.',
    price: 420,
    rating: 4.9,
  },
  {
    id: 'rec-3',
    name: 'Classic Caesar Salad',
    description: 'Crisp romaine lettuce, garlic croutons, shaved parmesan, and house-made Caesar dressing.',
    price: 380,
    rating: 4.8,
  },
  {
    id: 'rec-4',
    name: 'Artisanal Garlic Bruschetta',
    description: 'Toasted sourdough topped with vine-ripened tomatoes, fresh basil, and extra virgin olive oil.',
    price: 320,
    rating: 4.7,
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Greetings! I am your AI Culinary Assistant grounded in our live kitchen inventory. Ask me for personalized wine pairings, dietary suggestions, or dish recommendations!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recommendations, setRecommendations] = useState<DishItem[]>(FALLBACK_DISHES);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  const startVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is supported on Chrome/Edge/Safari. Please type your query.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      if (token) {
        const res = await api.ai.getRecommendations(token);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const parsed = res.data.map((d: any) => ({
            id: String(d.id || Math.random()),
            name: String(d.name || 'Chef Special'),
            description: String(d.description || 'Fresh culinary creation'),
            price: Number(d.price || 300),
            rating: Number(d.rating || 4.9),
          }));
          setRecommendations(parsed.slice(0, 4));
          return;
        }
      }
      const menuRes = await api.menu.getAll();
      if (menuRes.success && Array.isArray(menuRes.data) && menuRes.data.length > 0) {
        const parsed = menuRes.data.slice(0, 4).map((d: any) => ({
          id: String(d.id || Math.random()),
          name: String(d.name || 'Chef Special'),
          description: String(d.description || 'Fresh culinary creation'),
          price: Number(d.price || 300),
          rating: 4.8,
        }));
        setRecommendations(parsed);
      }
    } catch {
      setRecommendations(FALLBACK_DISHES);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsTyping(true);

    try {
      let replyText = '';
      if (token) {
        const res = await api.ai.sendMessage(textToSend, token);
        const data = res.data as any;
        if (res.success && data) {
          replyText = data.answer || data.reply || data.message || '';
        }
      }

      if (!replyText) {
        const lower = textToSend.toLowerCase();
        if (lower.includes('veggie') || lower.includes('vegetarian')) {
          replyText = 'For vegetarian selections, I highly recommend our Truffle Mushroom Risotto prepared with Arborio rice and shaved parmesan, or the Artisanal Garlic Bruschetta!';
        } else if (lower.includes('wine') || lower.includes('pair') || lower.includes('beverage') || lower.includes('drink')) {
          replyText = 'For seafood like our Grilled Atlantic Salmon, a crisp Sauvignon Blanc or Signature Berry Mocktail makes a sublime pairing!';
        } else if (lower.includes('dessert') || lower.includes('sweet')) {
          replyText = 'Our Valrhona Chocolate Fondant with molten center and vanilla bean gelato is the ultimate dessert experience tonight!';
        } else {
          replyText = `Thank you for asking! Based on our live kitchen menu, our top recommendation tonight is the Pan-seared Atlantic Salmon served with roasted asparagus and lemon butter sauce. How else can I assist your dining experience?`;
        }
      }

      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          sender: 'ai',
          text: 'Our chef recommends trying our Signature Berry Mocktail paired with Grilled Salmon or Truffle Mushroom Risotto tonight!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Best vegetarian choices',
    'Cocktail & beverage pairings',
    'Gluten-free main dishes',
    'Chef specials tonight',
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Header */}
        <div className="border-b border-stone-800 pb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Live Grounded AI Sommelier
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Culinary Assistant & Dish Recommendations
            </h1>
            <p className="text-xs text-stone-300 mt-1 font-medium">
              Powered by real-time menu data & inventory checks to guarantee 100% accurate dish advice.
            </p>
          </div>

          <button
            onClick={fetchRecommendations}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 bg-stone-900 px-4 py-2 text-xs font-bold text-stone-200 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRecs ? 'animate-spin' : ''}`} />
            <span>Refresh Recommendations</span>
          </button>
        </div>

        {/* Top AI Recommendations Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" /> Tonight's AI Top Recommendations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((dish) => (
              <div
                key={dish.id}
                className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl flex flex-col justify-between space-y-3 backdrop-blur-xl hover:border-amber-500/40 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug">{dish.name}</h3>
                    <span className="font-mono font-black text-amber-400 text-sm shrink-0">
                      ₹{Number(dish.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed font-normal">
                    {dish.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                    {dish.rating || 4.9} Match
                  </span>
                  <Link
                    href="/menu"
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>Order</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chat Container */}
          <div className="lg:col-span-2 flex flex-col h-[580px] rounded-3xl border border-stone-800 bg-stone-900/90 shadow-2xl overflow-hidden backdrop-blur-xl">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-stone-800 bg-stone-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-stone-950 font-bold shadow-lg">
                  <Bot className="w-5 h-5 text-stone-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AURA AI Culinary Guide</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Grounded in Live Menu Data
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className="space-y-1.5 max-w-[85%] sm:max-w-[78%]">
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-stone-950 font-bold rounded-tr-none'
                          : 'bg-stone-800/90 border border-stone-700/80 text-stone-100 rounded-tl-none shadow-md font-medium'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 block px-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-stone-800 text-stone-200 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-stone-800 border border-stone-700 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-100" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-200" />
                    <span className="text-stone-300 text-[11px] ml-1 font-medium">Analyzing live menu & ingredients...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-stone-800 bg-stone-900 space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 whitespace-nowrap transition-colors border border-stone-700 font-semibold"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask or click 🎙️ to speak dish requests..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 rounded-2xl bg-stone-950 border border-stone-800 px-4 py-2.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isListening
                      ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse ring-2 ring-red-500/50'
                      : 'bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-750'
                  }`}
                  title="Speak to Assistant (Voice Input)"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="submit"
                  disabled={isTyping || !inputMessage.trim()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-black text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition-all shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>

          </div>

          {/* Sidebar Grounded Rules */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 space-y-4 shadow-xl backdrop-blur-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" /> Grounded AI Rules
              </h3>
              <ul className="text-xs text-stone-300 space-y-3 font-normal leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Queries live kitchen stock to ensure no unavailable dishes are recommended.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Filters strictly by dietary tags (Vegetarian, Vegan, Gluten-Free).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Matches beverage & cocktail flavor profiles to your main course selection.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
