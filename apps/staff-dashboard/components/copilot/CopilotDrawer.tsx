'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { askAssistant } from '@/lib/api';
import type { AssistantResponseData } from '@smartdine/shared/types';
import { cn } from '@/lib/utils';

export interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text?: string;
  data?: AssistantResponseData;
  timestamp: string;
}

const QUICK_CHIPS = [
  { label: "Today's Sales", query: 'What is our total revenue and order count for the past week?' },
  { label: 'Inventory Alerts', query: 'Which inventory ingredients are low in stock?' },
  { label: 'Reservations', query: 'What are our upcoming reservations for the next 24 hours?' },
  { label: 'Peak Hours', query: 'What is our projected peak operating period tonight?' },
  { label: 'Forecast', query: 'What is our demand forecast and expected customer volume?' },
  { label: 'Kitchen Status', query: 'How many orders are currently active in the kitchen?' },
  { label: 'Menu Performance', query: 'Which dishes are currently our top sellers?' },
];

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key press & handle focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Auto-scroll chat thread to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputMessage('');
    setIsLoading(true);
    setErrorMessage(null);
    setLastQuery(textToSend);

    try {
      const responseData = await askAssistant(textToSend);
      const copilotMsg: ChatMessage = {
        id: `cop_${Date.now()}`,
        sender: 'copilot',
        data: responseData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch {
      setErrorMessage('Network connection lost while analyzing database. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSend(lastQuery);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="SmartDine Operations Copilot"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500/20 to-amber-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-100">Operations Copilot</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Live Status
                  </span>
                </div>
                <p className="text-xs text-slate-400">Grounded in SmartDine Database</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Close Copilot Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
            {/* Initial Operations Overview Grid (Visually Separated Status) */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Shift Operations Center
                </span>
                <span className="text-[10px] font-semibold text-slate-500">Live Metric Snapshot</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">7-Day Revenue</p>
                    <p className="font-bold text-slate-100">₹6,950.06</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Low Stock</p>
                    <p className="font-bold text-slate-100">2 Items</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Reservations</p>
                    <p className="font-bold text-slate-100">2 Bookings</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Peak Window</p>
                    <p className="font-bold text-slate-100">19:00 - 21:30</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400">Quick Operational Queries:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleSend(chip.query)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-brand-500/20 hover:text-brand-300 border border-slate-700/60 hover:border-brand-500/40 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <span>{chip.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Thread */}
            <div className="space-y-4 pt-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex flex-col space-y-1', msg.sender === 'user' ? 'items-end' : 'items-start')}
                >
                  {msg.sender === 'user' ? (
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-brand-500 px-4 py-2.5 text-xs font-medium text-white shadow-xs">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="max-w-[95%] w-full rounded-2xl rounded-tl-xs bg-slate-800/90 border border-slate-700/70 p-4 space-y-3 shadow-md">
                      {/* Supported Query Response */}
                      {msg.data?.supported ? (
                        <>
                          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                            <span className="px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-[10px] font-bold text-brand-400 uppercase">
                              Intent: {msg.data.intent}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              {msg.data.confidence}% Confidence
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 leading-relaxed font-sans">{msg.data.answer}</p>

                          {msg.data.sources && msg.data.sources.length > 0 && (
                            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400">
                              <span className="font-semibold">Sources:</span>
                              {msg.data.sources.map((src) => (
                                <span key={src} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                  {src}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        /* Refusal Guidance Card for Out-of-Scope Queries */
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>Operational Scope Guidance</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{msg.data?.message}</p>
                          {msg.data?.supportedTopics && (
                            <div className="pt-2 space-y-1">
                              <p className="font-semibold text-slate-200">Supported Operational Topics:</p>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1 text-[11px]">
                                {msg.data.supportedTopics.map((topic) => (
                                  <li key={topic}>{topic}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3 text-xs text-brand-400 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>Analyzing live restaurant database...</span>
                </div>
              )}

              {/* Error Handling with Retry */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-2">
                  <p className="font-semibold">⚠️ Request Failure</p>
                  <p>{errorMessage}</p>
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Request</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Prompt Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/95">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about sales, kitchen, inventory, staff..."
                disabled={isLoading}
                className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
