import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar as CalendarIcon, Plus, Clock, Users } from 'lucide-react';
import EventModal from '../components/modals/EventModal';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data.events || []);
        } catch (err) {
            console.error('Failed to fetch events', err);
            // mock if failed
            setEvents([
                { id: 1, title: 'Q1 Team Building', description: 'Company offsite for team building activities', event_date: new Date(Date.now() + 86400000 * 5).toISOString(), attendees: ['all'] },
                { id: 2, title: 'Annual Performance Review Kickoff', description: 'HR meeting covering review standards', event_date: new Date(Date.now() + 86400000 * 12).toISOString(), attendees: ['managers'] }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading calendar events...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Company Calendar</h1>
                    <p className="text-gray-500">Upcoming HR events, meetings, and deadlines.</p>
                </div>
                <button
                    onClick={() => setIsEventModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Event
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev) => (
                    <div key={ev.id} className="card hover:border-primary-300 transition border border-transparent">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-50 p-3 rounded-xl border border-primary-100 flex flex-col items-center justify-center min-w-[3.5rem]">
                                    <span className="text-xs font-bold text-primary-600 uppercase">
                                        {new Date(ev.event_date).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span className="text-xl font-bold text-gray-900 leading-none mt-1">
                                        {new Date(ev.event_date).getDate()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 leading-tight">{ev.title}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(ev.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 flex-1">
                            {ev.description || 'No additional details provided.'}
                        </p>

                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 text-xs text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>Invited: <span className="font-medium text-gray-700">{Array.isArray(ev.attendees) ? ev.attendees.join(', ') : 'Everyone'}</span></span>
                        </div>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border-dashed border-2">
                        No upcoming events.
                    </div>
                )}
            </div>

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onEventAdded={(newEvent) => setEvents([newEvent, ...events])}
            />
        </div>
    );
};

export default CalendarPage;
