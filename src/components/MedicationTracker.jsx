import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Clock, CheckCircle, Pill, Syringe, AlertTriangle, X, Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TYPES = [
    { id: 'pill', label: 'Pill', icon: <Pill className="w-5 h-5" /> },
    { id: 'syrup', label: 'Liquid', icon: <Droplet className="w-5 h-5" /> },
    { id: 'injection', label: 'Injection', icon: <Syringe className="w-5 h-5" /> },
];

const MedicationTracker = () => {
    const navigate = useNavigate();
    const [meds, setMeds] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        dosage: '',
        type: 'pill',
        time: '',
        instructions: 'after_food', // before_food, after_food
        totalPills: 30, // For refill tracking
    });

    // Load Data
    useEffect(() => {
        const saved = localStorage.getItem('care_connect_meds');
        if (saved) {
            setMeds(JSON.parse(saved));
        }
        // Request notification permission
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }, []);

    const saveMeds = (updatedMeds) => {
        setMeds(updatedMeds);
        localStorage.setItem('care_connect_meds', JSON.stringify(updatedMeds));
    };

    // Notification Logic
    useEffect(() => {
        const checkMeds = () => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            const today = now.toDateString();

            meds.forEach(med => {

                if (med.time === currentTime && med.lastTakenDate !== today) {

                    // Prevent spamming notification in the same minute
                    const lastNotified = sessionStorage.getItem(`notified-${med.id}-${today}`);
                    if (lastNotified === currentTime) return;

                    // Mark as notified for this minute
                    sessionStorage.setItem(`notified-${med.id}-${today}`, currentTime);

                    // SOUND ALERT
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple chime
                    audio.play().catch(e => console.log('Audio play failed', e));

                    // Send Notification
                    if (Notification.permission === 'granted') {
                        new Notification(`Time for your medicine: ${med.name}`, {
                            body: `Take ${med.dosage}. ${med.instructions === 'after_food' ? 'Take after eating.' : 'Take on empty stomach.'}`,
                            icon: '/pwa-192x192.png' // assumption
                        });
                    }
                    // In-app toast
                    toast((t) => (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-900/50 rounded-full flex items-center justify-center text-green-400">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Time for {med.name}</p>
                                <p className="text-sm text-gray-500">Take {med.dosage}</p>
                            </div>
                            <button onClick={() => { takeMed(med.id); toast.dismiss(t.id); }} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold ml-2">
                                Take
                            </button>
                        </div>
                    ), { duration: 10000, position: 'top-center' });
                }
            });
        };

        const interval = setInterval(checkMeds, 10000); // Check every 10 seconds
        checkMeds(); // Run immediately on mount
        return () => clearInterval(interval);
    }, [meds]);

    const addMed = () => {
        if (!newItem.name || !newItem.time || !newItem.dosage) {
            toast.error('Please fill all required fields');
            return;
        }

        const med = {
            ...newItem,
            id: Date.now(),
            lastTakenDate: null
        };

        saveMeds([...meds, med]);
        setNewItem({ name: '', dosage: '', type: 'pill', time: '', instructions: 'after_food', totalPills: 30 });
        setShowForm(false);
        toast.success('Medication added!');
    };

    const takeMed = (id) => {
        const today = new Date().toDateString();
        const updated = meds.map(m => {
            if (m.id === id) {
                if (m.lastTakenDate === today) return m; // Already taken
                const newCount = Math.max(0, parseInt(m.totalPills) - 1);
                if (newCount <= 5) toast.error(`Refill Warning: Only ${newCount} ${m.name} left!`, { icon: '⚠️' });
                return { ...m, lastTakenDate: today, totalPills: newCount };
            }
            return m;
        });
        saveMeds(updated);
        toast.success('Medication recorded as taken');
    };

    const deleteMed = (id) => {
        if (window.confirm('Delete this medication?')) {
            saveMeds(meds.filter(m => m.id !== id));
            toast.success('Deleted');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'syrup': return <Droplet className="w-6 h-6 text-blue-400" />;
            case 'injection': return <Syringe className="w-6 h-6 text-red-400" />;
            default: return <Pill className="w-6 h-6 text-green-400" />;
        }
    };

    const isTakenToday = (dateString) => {
        return dateString === new Date().toDateString();
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-white selection:bg-green-500 selection:text-white">
            {/* Header */}
            <header className="bg-slate-950/80 backdrop-blur-xl px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="font-bold text-xl text-white tracking-tight">Medication Tracker</h1>
                    <p className="text-xs text-green-400 font-medium">Stay healthy, stay on time</p>
                </div>
                <div className="w-8" />
            </header>

            <main className="flex-grow p-4 md:p-6 max-w-2xl mx-auto w-full">

                {/* Stats / Next Dose */}
                {meds.length > 0 && (
                    <div className="mb-8 grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-center items-center text-center">
                            <span className="text-3xl font-bold text-green-400">
                                {meds.filter(m => isTakenToday(m.lastTakenDate)).length}/{meds.length}
                            </span>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Taken Today</span>
                        </div>
                        <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-2xl shadow-lg shadow-green-900/40 flex flex-col justify-center items-center text-center text-white border border-green-500/20">
                            <Clock className="w-6 h-6 mb-2 opacity-80" />
                            <span className="text-sm font-medium opacity-90">Next Reminder</span>
                            <span className="font-bold text-lg">
                                Check Sched
                            </span>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {meds.length === 0 && !showForm && (
                    <div className="text-center py-20 opacity-60">
                        <div className="w-24 h-24 bg-white/5 rounded-full mx-auto mb-6 flex items-center justify-center border border-white/5">
                            <Pill className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No Medications Yet</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Add your medicines to get reminders and track your dosage history.</p>
                    </div>
                )}

                {/* Meds List */}
                <div className="space-y-4 pb-24">
                    <AnimatePresence>
                        {meds.sort((a, b) => a.time.localeCompare(b.time)).map(med => {
                            const taken = isTakenToday(med.lastTakenDate);
                            return (
                                <motion.div
                                    key={med.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative p-5 rounded-2xl border transition-all duration-300 group
                                        ${taken
                                            ? 'bg-slate-900/50 border-white/5 opacity-60'
                                            : 'bg-slate-900 border-white/10 shadow-lg hover:border-green-500/30'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 
                                                ${taken ? 'bg-white/5' : 'bg-green-500/10'}`}>
                                                {getIcon(med.type)}
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg leading-tight mb-1 ${taken ? 'text-slate-500 line-through' : 'text-white'}`}>{med.name}</h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1 font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                                                        <Clock className="w-3 h-3" /> {med.time}
                                                    </span>
                                                    <span>{med.dosage}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20">
                                                        {med.instructions === 'before_food' ? 'Before Food' : 'After Food'}
                                                    </span>
                                                </div>
                                                {med.totalPills < 10 && (
                                                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-2">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {med.totalPills} left in stock
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={() => takeMed(med.id)}
                                                disabled={taken}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm
                                                    ${taken
                                                        ? 'bg-green-600 text-white cursor-default'
                                                        : 'border-2 border-white/10 text-slate-500 hover:border-green-500 hover:text-green-400 bg-white/5'}`}
                                                title="Take Medicine"
                                            >
                                                <CheckCircle className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteMed(med.id); }}
                                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </main>

            {/* FAB */}
            <button
                onClick={() => setShowForm(true)}
                className="fixed bottom-8 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl shadow-green-900/40 flex items-center justify-center hover:bg-green-500 hover:scale-105 active:scale-95 transition-all z-20 group"
            >
                <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Add Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            className="bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Add Medication</h3>
                                    <p className="text-slate-500 text-sm">Set up your reminders</p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">Medicine Name</label>
                                    <input
                                        autoFocus
                                        className="w-full text-lg p-4 bg-white/5 rounded-2xl border border-transparent focus:border-green-500 outline-none transition-all text-white placeholder:text-slate-600"
                                        placeholder="e.g. Amoxicillin"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>

                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">Type</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {TYPES.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setNewItem({ ...newItem, type: t.id })}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
                                                    ${newItem.type === t.id
                                                        ? 'bg-green-500/20 border-green-500 text-green-400 font-semibold'
                                                        : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
                                            >
                                                {t.icon}
                                                <span className="text-sm">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Dosage */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-400 mb-2">Dosage</label>
                                        <input
                                            className="w-full p-4 bg-white/5 rounded-2xl border border-transparent focus:border-green-500 outline-none transition-all text-white placeholder:text-slate-600"
                                            placeholder="e.g. 500mg"
                                            value={newItem.dosage}
                                            onChange={e => setNewItem({ ...newItem, dosage: e.target.value })}
                                        />
                                    </div>
                                    {/* Time */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-400 mb-2">Time</label>
                                        <input
                                            type="time"
                                            className="w-full p-4 bg-white/5 rounded-2xl border border-transparent focus:border-green-500 outline-none transition-all text-white inverted-calendar-icon"
                                            value={newItem.time}
                                            onChange={e => setNewItem({ ...newItem, time: e.target.value })}
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">Instructions</label>
                                    <div className="flex bg-white/5 p-1 rounded-xl">
                                        <button
                                            onClick={() => setNewItem({ ...newItem, instructions: 'before_food' })}
                                            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${newItem.instructions === 'before_food' ? 'bg-slate-800 shadow text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Before Food
                                        </button>
                                        <button
                                            onClick={() => setNewItem({ ...newItem, instructions: 'after_food' })}
                                            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${newItem.instructions === 'after_food' ? 'bg-slate-800 shadow text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            After Food
                                        </button>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">Current Stock (Refill Alert)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            className="flex-1 p-4 bg-white/5 rounded-2xl border border-transparent focus:border-green-500 outline-none transition-all text-white placeholder:text-slate-600"
                                            placeholder="e.g. 30"
                                            value={newItem.totalPills}
                                            onChange={e => setNewItem({ ...newItem, totalPills: e.target.value })}
                                        />
                                        <span className="text-slate-500 text-sm font-medium">pills left</span>
                                    </div>
                                </div>

                                <button
                                    onClick={addMed}
                                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-500 shadow-xl shadow-green-900/20 active:scale-[0.98] transition-all"
                                >
                                    Save Routine
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MedicationTracker;
