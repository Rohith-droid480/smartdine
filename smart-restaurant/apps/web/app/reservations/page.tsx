'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { Table, Reservation } from '../../lib/types';

export default function ReservationsPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [partySize, setPartySize] = useState<number>(2);
  const [date, setDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('19:30');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tableRes, resRes] = await Promise.all([
        api.getTables(),
        api.getReservations()
      ]);
      if (tableRes.success && tableRes.data) {
        setTables(tableRes.data);
        const free = tableRes.data.find(t => t.status === 'free');
        if (free) setSelectedTableId(free.id);
      }
      if (resRes.success && resRes.data) {
        setReservations(resRes.data);
      }
    } catch (err) {
      setError('Failed to load table reservation data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId) {
      setError('Please select an available table.');
      return;
    }
    setBookingLoading(true);
    setError(null);
    setSuccessMsg(null);

    const isoDateTime = new Date(`${date}T${time}:00`).toISOString();

    try {
      const res = await api.createReservation({
        tableId: selectedTableId,
        time: isoDateTime,
        partySize,
        specialRequests
      });

      if (res.success && res.data) {
        setSuccessMsg(`Reservation #${res.data.id} confirmed!`);
        fetchData(); // Refresh list
      } else {
        setError(res.error || 'Failed to complete reservation.');
      }
    } catch (e) {
      setError('An error occurred while booking table.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      const res = await api.cancelReservation(id);
      if (res.success) {
        fetchData();
      }
    } catch (e) {
      setError('Failed to cancel reservation.');
    }
  };

  const availableTables = tables.filter(t => t.capacity >= partySize && t.status === 'free');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <Badge variant="gold" size="sm" className="mb-2 uppercase tracking-wider">
          <CalendarDays className="w-3.5 h-3.5 mr-1 text-amber-400" />
          Instant Table Booking
        </Badge>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
          Reserve Your Dining Experience
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-light">
          Choose party size, location preference, and time slot with instant seat confirmation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Book a Table
            </h2>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-6">
              
              {/* Party Size Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Party Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 6, 8].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPartySize(size)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        partySize === size
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{size} {size === 1 ? 'Guest' : 'Guests'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Time Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  leftIcon={<CalendarDays className="w-4 h-4 text-amber-400" />}
                  required
                />
                <Input
                  label="Time Slot"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  leftIcon={<Clock className="w-4 h-4 text-amber-400" />}
                  required
                />
              </div>

              {/* Table Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Select Table & Location
                </label>

                {loading ? (
                  <Skeleton variant="card" className="h-20" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tables.map((table) => {
                      const isFit = table.capacity >= partySize;
                      const isFree = table.status === 'free';
                      const isSelectable = isFit && isFree;
                      const isSelected = selectedTableId === table.id;

                      return (
                        <div
                          key={table.id}
                          onClick={() => isSelectable && setSelectedTableId(table.id)}
                          className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-glow-amber'
                              : isSelectable
                              ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                              : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-sm">Table {table.number}</span>
                            <Badge variant={isFree ? 'emerald' : 'rose'} size="sm">
                              {isFree ? 'Available' : table.status}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-slate-400">
                            <span className="capitalize flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-400" />
                              {table.location?.replace('_', ' ')}
                            </span>
                            <span>Cap: {table.capacity} Guests</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <Input
                label="Special Requests (Optional)"
                placeholder="High chair, dietary notes, window seat..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={bookingLoading}
                disabled={!selectedTableId}
              >
                Confirm Table Booking
              </Button>

            </form>
          </Card>
        </div>

        {/* Existing Reservations Sidebar */}
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Your Bookings
          </h2>

          {loading ? (
            <div className="space-y-3">
              <Skeleton variant="card" className="h-32" />
              <Skeleton variant="card" className="h-32" />
            </div>
          ) : reservations.length === 0 ? (
            <Card className="text-center py-8 space-y-2">
              <CalendarDays className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No active reservations found.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reservations.map((res) => (
                <Card key={res.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-slate-100">
                        {res.tableName || `Reservation #${res.id}`}
                      </h4>
                      <p className="text-xs text-amber-400 mt-0.5">
                        {new Date(res.time).toLocaleDateString()} at {new Date(res.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        res.status === 'confirmed'
                          ? 'emerald'
                          : res.status === 'cancelled'
                          ? 'rose'
                          : 'amber'
                      }
                    >
                      {res.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-4">
                    <span>Party: {res.partySize} Guests</span>
                  </div>

                  {res.specialRequests && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-900 p-2 rounded-lg border border-slate-800">
                      "{res.specialRequests}"
                    </p>
                  )}

                  {res.status !== 'cancelled' && (
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => handleCancelReservation(res.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
