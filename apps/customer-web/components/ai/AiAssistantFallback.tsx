'use client';

import React, { useState } from 'react';

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        aria-label="SmartDine AI Assistant"
      >
        <span className="text-lg">✨</span>
        <span>AI Assistant</span>
      </button>

      {/* Slide-over Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-right p-4 sm:items-center sm:justify-center bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all border border-orange-100">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>

            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-100 to-amber-100 flex items-center justify-center text-3xl shadow-inner">
                ⚡
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">AI Assistant & Personalization</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mt-1">
                  System Status: Scheduled Maintenance
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-left text-xs text-amber-900 space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Feature Temporarily Unavailable
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Our smart recommendations engine and conversational dining concierge are currently undergoing infrastructure maintenance for performance optimization.
                </p>
              </div>

              <div className="w-full text-left space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <p className="font-medium text-gray-800">What you can do right now:</p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-gray-500">
                  <li>Browse dishes directly in the <strong className="text-gray-700">Digital Menu</strong></li>
                  <li>Reserve dining tables via <strong className="text-gray-700">Reservations</strong></li>
                  <li>Track live kitchen status under <strong className="text-gray-700">Orders</strong></li>
                </ul>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors mt-2"
              >
                Got It
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
    <div className="my-8 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-orange-50/60 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="text-lg font-bold text-gray-900">Personalized Recommendations</h3>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Maintenance
            </span>
          </div>
          <p className="text-xs text-gray-500">
            AI-driven dish pairing & chef recommendations are undergoing scheduled upgrades.
          </p>
        </div>
        <a
          href="/menu"
          className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition-colors shadow-xs"
        >
          Explore Complete Menu &rarr;
        </a>
      </div>
    </div>
  );
}
