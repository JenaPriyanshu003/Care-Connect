import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, ExternalLink, Siren, Stethoscope, Pill, Hospital, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const EmergencyFinder = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getLocation = () => {
        setLoading(true);
        setError('');
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLoading(false);
            },
            (error) => {
                setError("Unable to retrieve your location. Please enable GPS.");
                setLoading(false);
            }
        );
    };

    const emergencyOptions = [
        {
            name: 'Hospitals',
            icon: Hospital,
            color: 'text-red-400',
            bg: 'bg-red-500/10 group-hover:bg-red-500/20',
            border: 'hover:border-red-500/50',
            desc: 'Trauma & Emergency',
            query: 'hospital'
        },
        {
            name: 'Pharmacies',
            icon: Pill,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
            border: 'hover:border-emerald-500/50',
            desc: 'Medicine & Supplies',
            query: 'pharmacy'
        },
        {
            name: 'Clinics',
            icon: Stethoscope,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
            border: 'hover:border-blue-500/50',
            desc: 'General Practice',
            query: 'clinic'
        },
        {
            name: 'Ambulance',
            icon: Siren,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
            border: 'hover:border-orange-500/50',
            desc: 'Urgent Transport',
            query: 'ambulance service'
        },
    ];

    return (
        <div className="h-screen bg-slate-950 flex flex-col font-sans overflow-hidden text-white selection:bg-red-500 selection:text-white">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <header className="relative z-10 bg-slate-950/80 backdrop-blur-md px-8 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
                <button
                    onClick={() => navigate('/')}
                    className="p-2.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500">
                        <Siren className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white text-lg">Emergency Finder</span>
                </div>
                <div className="w-10" />
            </header>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-10 relative"
                >
                    {/* Premium Pulse Effect */}
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-[-15px] bg-red-500/10 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />

                    <div className="relative bg-slate-900 p-8 rounded-full shadow-2xl shadow-red-900/20 border border-white/10">
                        <MapPin className="w-16 h-16 text-red-500 drop-shadow-sm" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 max-w-md mx-auto"
                >
                    <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Nearest Aid Radar</h2>
                    <p className="text-slate-400 text-lg">
                        Instantly locate reliable medical help around you using high-precision GPS.
                    </p>
                </motion.div>

                {error && (
                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-red-500/10 text-red-400 px-6 py-4 rounded-xl mb-6 border border-red-500/20 font-medium">
                        {error}
                    </motion.div>
                )}

                {!location ? (
                    <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={getLocation}
                        disabled={loading}
                        className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-red-900/40 transition-all border border-red-500/50"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Scanning Area...
                                </>
                            ) : (
                                <>
                                    <Navigation className="w-5 h-5" />
                                    Locate Nearby Help
                                </>
                            )}
                        </span>
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-5 px-4"
                    >
                        {emergencyOptions.map((option, idx) => (
                            <a
                                key={idx}
                                href={`https://www.google.com/maps/search/${option.query}/@${location.lat},${location.lng},14z`}
                                target="_blank"
                                rel="noreferrer"
                                className={`group p-6 bg-slate-900 border border-white/10 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between ${option.border}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 ${option.bg} rounded-2xl flex items-center justify-center transition-colors`}>
                                        <option.icon className={`w-7 h-7 ${option.color}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-lg group-hover:text-slate-200 transition-colors">{option.name}</div>
                                        <div className="text-sm text-slate-500 font-medium">{option.desc}</div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all text-slate-500">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                            </a>
                        ))}
                    </motion.div>
                )}

                {location && (
                    <motion.button
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        onClick={() => setLocation(null)}
                        className="mt-8 text-slate-500 text-sm hover:text-red-400 transition-colors font-medium flex items-center gap-2"
                    >
                        <MapPin className="w-3 h-3" /> Update Location
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default EmergencyFinder;
