'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Reservation, Table } from '@smartdine/shared/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  UtensilsCrossed,
  ArrowRight,
  Lock,
} from 'lucide-react';

export default function ReservationsPage() {
  const { token, user } = useAuth();

  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(true);
  const [isLoadingReservations, setIsLoadingReservations] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [partySize, setPartySize] = useState<number>(2);
  const [reservationTime, setReservationTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchTables = useCallback(async () => {
    if (!token) {
      setIsLoadingTables(false);
      return;
    }
    setIsLoadingTables(true);
    try {
      const res = await api.reservations.getTables(token);
      if (res.success && Array.isArray(res.data)) {
        setTables(res.data);
      }
    } catch {
      // ignore table load error silently or degrade
    } finally {
      setIsLoadingTables(false);
    }
  }, [token]);

  const fetchReservations = useCallback(async () => {
    if (!token) {
      setIsLoadingReservations(false);
      return;
    }
    setIsLoadingReservations(true);
    setErrorMsg(null);
    try {
      const res = await api.reservations.getOwn(token);
      if (res.success && Array.isArray(res.data)) {
        setReservations(res.data);
      } else {
        setErrorMsg(res.error ?? 'Failed to load your reservations.');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message ?? 'Network error fetching reservations.');
    } finally {
      setIsLoadingReservations(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTables();
    fetchReservations();

    const interval = setInterval(() => {
      fetchTables();
      fetchReservations();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchTables, fetchReservations]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedTableId) {
      setErrorMsg('Please select a dining table from the layout grid.');
      return;
    }

    if (!reservationTime) {
      setErrorMsg('Please choose a valid reservation date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isoTime = new Date(reservationTime).toISOString();
      const res = await api.reservations.create(token, {
        tableId: selectedTableId,
        time: isoTime,
        partySize: Number(partySize),
      });

      if (res.success && res.data) {
        setSuccessMsg(`Reservation booked successfully! Reservation ID: ${res.data.id.substring(0, 8)}`);
        setSelectedTableId('');
        fetchReservations();
        fetchTables();
      } else {
        setErrorMsg(res.error ?? 'Failed to complete reservation. Table may already be reserved.');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message ?? 'Network error creating reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to cancel this table reservation?')) return;

    try {
      const res = await api.reservations.cancel(token, reservationId);
      if (res.success) {
        setSuccessMsg('Reservation cancelled.');
        fetchReservations();
        fetchTables();
      } else {
        setErrorMsg(res.error ?? 'Failed to cancel reservation.');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message ?? 'Network error cancelling reservation.');
    }
  };

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-4 py-20 font-sans">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Table Reservations</h1>
            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              Sign in to your customer account to view live table layout availability and make instant dining room reservations.
            </p>
          </div>
          <Link
            href="/auth/login?redirect=/reservations"
            className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-xs font-black text-stone-950 shadow-xl hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            <span>Sign In to Reserve a Table</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 space-y-12 font-sans">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-stone-900 border-b border-stone-800 py-16 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="mx-auto max-w-7xl relative z-10 space-y-3 text-left">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Table Reservations
          </h1>
          <p className="max-w-xl text-sm sm:text-base text-stone-300 font-normal leading-relaxed">
            Select a dining table and choose your preferred time.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {errorMsg && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-300 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Booking Form & Layout Grid (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-8 shadow-xl space-y-8 backdrop-blur-xl">
              <div className="space-y-4">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2.5 border-b border-stone-800 pb-3">
                  <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                  <span>1. Select Dining Table</span>
                </h2>

                {/* Tables Layout Grid */}
                {isLoadingTables ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-800" />
                    ))}
                  </div>
                ) : tables.length === 0 ? (
                  <div className="rounded-2xl bg-stone-800/40 p-8 text-center text-xs text-stone-400">
                    No dining tables available at this moment.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {tables.map((table) => {
                      const isSelected = selectedTableId === table.id;
                      const isAvailable = table.status === 'free';

                      return (
                        <button
                          key={table.id}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setSelectedTableId(table.id)}
                          className={`flex flex-col items-center justify-center rounded-2xl p-5 transition-all duration-300 border text-center relative overflow-hidden ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 text-amber-300 font-bold shadow-lg scale-105'
                              : isAvailable
                              ? 'border-stone-800 bg-stone-850/60 hover:border-stone-700 hover:bg-stone-800 text-stone-200'
                              : 'border-stone-850 bg-stone-900/40 text-stone-500 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-sm font-extrabold text-white">Table #{table.number}</span>
                          <span className="text-[11px] text-stone-400 mt-1">Cap: {table.capacity} guests</span>
                          <span
                            className={`mt-2 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                              table.status === 'free'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : table.status === 'reserved'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {table.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-6 pt-6 border-t border-stone-800">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>2. Party Size & Schedule</span>
                </h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Party Size (Guests)
                    </label>
                    <select
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      className="w-full rounded-2xl border border-stone-700 bg-stone-800/80 px-4 py-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num} className="bg-stone-900 text-white">
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Reservation Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                      className="w-full rounded-2xl border border-stone-700 bg-stone-800/80 px-4 py-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTableId || !reservationTime}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-4 text-xs font-black text-stone-950 shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Confirming Table Reservation...</span>
                    </>
                  ) : (
                    <span>Book Reservation Now &rarr;</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Existing Reservations History Sidebar (1 col) */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-6 backdrop-blur-xl">
              <h2 className="text-base font-extrabold text-white border-b border-stone-800 pb-3 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                <span>Your Active Bookings</span>
              </h2>

              {/* LOADING STATE */}
              {isLoadingReservations && (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-800" />
                  ))}
                </div>
              )}

              {/* EMPTY STATE */}
              {!isLoadingReservations && reservations.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <UtensilsCrossed className="w-10 h-10 text-stone-500 mx-auto" />
                  <p className="text-sm font-bold text-white">No Active Reservations</p>
                  <p className="text-xs text-stone-400">
                    Select a table and choose a time to place your booking.
                  </p>
                </div>
              )}

              {/* POPULATED RESERVATION CARDS */}
              {!isLoadingReservations && reservations.length > 0 && (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {reservations.map((res) => (
                    <div
                      key={res.id}
                      className="rounded-2xl border border-stone-800 bg-stone-850/60 p-4 space-y-3 shadow-md hover:border-stone-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-300 font-mono">
                          #{res.id.substring(0, 8)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            res.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : res.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : res.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>

                      <div className="text-xs text-stone-300 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          <span>Party: <strong className="text-white font-bold">{res.partySize} Guests</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Time: <strong className="text-white font-bold">{new Date(res.time).toLocaleString()}</strong></span>
                        </p>
                      </div>

                      {(res.status === 'pending' || res.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelReservation(res.id)}
                          className="pt-1 text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

