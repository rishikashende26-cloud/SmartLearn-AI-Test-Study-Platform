import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from './UI';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Bell, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Event {
  id: number;
  userId: number;
  title: string;
  time: string;
  room: string;
  color: string;
  date: string;
  reminder: boolean;
}

export const ScheduleModule = ({ user, onBack }: { user: any, onBack: () => void }) => {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newColor, setNewColor] = useState('bg-blue-500');
  const [newReminder, setNewReminder] = useState(false);

  const colors = [
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Red', value: 'bg-red-500' },
  ];

  useEffect(() => {
    fetchEvents();
  }, [user.id]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      userId: user.id,
      title: newTitle,
      time: newTime,
      room: newRoom,
      color: newColor,
      date: new Date().toISOString().split('T')[0],
      reminder: newReminder
    };

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      const data = await response.json();
      if (data.success) {
        setEvents([...events, data.event]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewTime('');
    setNewRoom('');
    setNewColor('bg-blue-500');
    setNewReminder(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <div className="flex gap-4">
            <div className="bg-white rounded-xl p-1 shadow-sm flex">
              <button 
                onClick={() => setView('day')}
                className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", view === 'day' ? "bg-blue-600 text-white" : "text-gray-500")}
              >
                Day
              </button>
              <button 
                onClick={() => setView('week')}
                className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", view === 'week' ? "bg-blue-600 text-white" : "text-gray-500")}
              >
                Week
              </button>
            </div>
            <Button variant="ghost" onClick={onBack}>Dashboard</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                  <h2 className="text-xl font-bold">Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h2>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={20} /></button>
                </div>
                <Button variant="primary" size="sm" className="gap-2" onClick={() => setShowAddModal(true)}>
                  <Plus size={18} /> Add Event
                </Button>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-12 text-gray-400">Loading schedule...</div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                    No events scheduled for today.
                  </div>
                ) : (
                  events.map((item) => (
                    <motion.div 
                      key={item.id}
                      whileHover={{ x: 4 }}
                      className="flex gap-6 items-start group"
                    >
                      <div className="w-20 pt-1 text-sm font-bold text-gray-400">{item.time.split(' - ')[0] || item.time}</div>
                      <div className={cn("flex-1 p-6 rounded-2xl text-white shadow-sm transition-all group-hover:shadow-md relative", item.color)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                            <p className="text-white/80 text-sm flex items-center gap-2">
                              <Clock size={14} /> {item.time} {item.room && `• ${item.room}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.reminder && <Bell size={16} className="text-white/80" />}
                            <button 
                              onClick={() => handleDeleteEvent(item.id)}
                              className="p-2 hover:bg-white/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Bell size={18} className="text-blue-600" /> Today's Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    {events.length > 0 ? `You have ${events.length} events today.` : "Your day is clear! Use it for deep study."}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    Consistent study habits lead to better retention.
                  </li>
                </ul>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-4">Today's Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Events Completed</span>
                    <span className="font-bold">0 / {events.length}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-0" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Study Time</span>
                    <span className="font-bold">0h 0m</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Reminders Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-6">Upcoming Reminders</h3>
              <div className="space-y-4">
                {events.filter(e => e.reminder).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No reminders set.</p>
                ) : (
                  events.filter(e => e.reminder).map((event) => (
                    <div key={event.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="font-bold text-gray-900 mb-1">{event.title}</p>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-blue-600">{event.time}</span>
                        <span className="text-gray-400">{event.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
            
            <Button 
              variant="outline" 
              className="w-full py-6 rounded-2xl border-dashed border-2 border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-600"
              onClick={() => {
                setShowAddModal(true);
                setNewReminder(true);
              }}
            >
              <Plus className="mr-2" /> Set Quick Reminder
            </Button>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Event</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input 
                    placeholder="e.g. Math Study Session" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <Input 
                      placeholder="e.g. 10:00 AM" 
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room/Location</label>
                    <Input 
                      placeholder="e.g. Library" 
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Label</label>
                  <div className="flex gap-3">
                    {colors.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setNewColor(c.value)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          c.value,
                          newColor === c.value ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "opacity-70 hover:opacity-100"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox" 
                    id="reminder" 
                    checked={newReminder}
                    onChange={(e) => setNewReminder(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="reminder" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Bell size={16} /> Set Reminder
                  </label>
                </div>
                <Button type="submit" className="w-full py-4 mt-4">Create Event</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
