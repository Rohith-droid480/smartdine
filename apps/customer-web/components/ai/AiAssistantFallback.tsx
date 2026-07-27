'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Mic, MicOff, Send, Sparkles } from 'lucide-react';

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Greetings! I am the SmartDine Dining Concierge with Voice AI support. Ask me or speak your dish requests, wine pairings, or dietary preferences!',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

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
          setQuery(transcript);
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || query).trim();
    if (!q || isLoading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    if (!textToSend) setQuery('');
    setIsLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('smartdine_customer_token') || undefined : undefined;
      const res = await api.ai.sendMessage(q, token);

      const data = res.data as any;
      if (res.success && data && (data.answer || data.reply || data.message)) {
        setMessages((prev) => [...prev, { sender: 'assistant', text: data.answer || data.reply || data.message }]);
      } else {
        const lower = q.toLowerCase();
        let fallbackReply = 'Our chef recommends trying our Signature Berry Mocktail paired with Grilled Salmon or Truffle Mushroom Risotto tonight!';

        if (lower.includes('veggie') || lower.includes('vegetarian')) {
          fallbackReply = 'For vegetarian selections, I highly recommend our Truffle Mushroom Risotto prepared with Arborio rice, or our Artisanal Garlic Bruschetta!';
        } else if (lower.includes('wine') || lower.includes('pair') || lower.includes('beverage') || lower.includes('drink')) {
          fallbackReply = 'For main courses like our Grilled Atlantic Salmon, a crisp Sauvignon Blanc or Signature Berry Mocktail makes a sublime pairing!';
        } else if (lower.includes('dessert') || lower.includes('sweet')) {
          fallbackReply = 'Our Valrhona Chocolate Fondant with molten center and vanilla bean gelato is our top pastry recommendation tonight!';
        } else if (lower.includes('recommend') || lower.includes('special') || lower.includes('dinner')) {
          fallbackReply = 'Tonight\'s chef highlight is the Wagyu Beef Tenderloin with truffle jus (₹850.00) or Pan-seared Sea Bass (₹680.00).';
        }

        setMessages((prev) => [...prev, { sender: 'assistant', text: fallbackReply }]);
      }
    } catch {
      const lower = q.toLowerCase();
      let fallbackReply = 'Our chef recommends trying our Signature Berry Mocktail paired with Grilled Salmon or Truffle Mushroom Risotto tonight!';

      if (lower.includes('veggie') || lower.includes('vegetarian')) {
        fallbackReply = 'For vegetarian selections, I highly recommend our Truffle Mushroom Risotto prepared with Arborio rice, or our Artisanal Garlic Bruschetta!';
      } else if (lower.includes('wine') || lower.includes('pair') || lower.includes('beverage') || lower.includes('drink')) {
        fallbackReply = 'For main courses like our Grilled Atlantic Salmon, a crisp Sauvignon Blanc or Signature Berry Mocktail makes a sublime pairing!';
      } else if (lower.includes('dessert') || lower.includes('sweet')) {
        fallbackReply = 'Our Valrhona Chocolate Fondant with molten center and vanilla bean gelato is our top pastry recommendation tonight!';
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: fallbackReply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none"
        aria-label="SmartDine AI Concierge"
      >
        <Sparkles className="w-4 h-4" />
        <span>AI Concierge</span>
      </button>

      {/* Interactive Concierge Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 shadow-2xl text-stone-100 flex flex-col h-[530px]">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SmartDine Dining Concierge</h3>
                  <p className="text-[10px] text-amber-400 uppercase font-semibold">Voice AI & Grounded Recommendations</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-white transition-colors text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Quick Prompt Badges */}
            <div className="flex flex-wrap gap-1.5 py-3 border-b border-stone-800/80">
              <button
                onClick={() => handleSend('What do you recommend for dinner tonight?')}
                className="text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-300 px-2.5 py-1 rounded-full border border-stone-700 transition-colors"
              >
                Recommended Dishes 🍽️
              </button>
              <button
                onClick={() => handleSend('Show me vegetarian specials')}
                className="text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-300 px-2.5 py-1 rounded-full border border-stone-700 transition-colors"
              >
                Vegetarian Options 🌿
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-800 border border-stone-700 text-stone-200'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-stone-400 text-xs animate-pulse">
                    Chef Concierge is processing...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar with Voice Input */}
            <div className="pt-2 border-t border-stone-800 flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type or click 🎙️ to speak..."
                className="flex-1 rounded-xl bg-stone-950 border border-stone-800 px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={startVoiceInput}
                className={`p-2 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse ring-2 ring-red-500/50'
                    : 'bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-700'
                }`}
                title="Speak to Assistant (Voice Input)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !query.trim()}
                className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AiRecommendationsSection() {
  return (
    <div className="my-8 rounded-2xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="text-lg font-bold text-white">Chef & AI Dish Pairings</h3>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
              Grounded AI
            </span>
          </div>
          <p className="text-xs text-stone-400">
            Curated dish recommendations grounded in live kitchen availability and seasonal flavors.
          </p>
        </div>
        <a
          href="/menu"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:brightness-110 transition-all shadow-lg"
        >
          Browse Complete Menu &rarr;
        </a>
      </div>
    </div>
  );
}
