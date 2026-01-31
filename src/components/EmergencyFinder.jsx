import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white px-4 py-3 border-b flex items-center justify-between shadow-sm">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <h1 className="font-bold text-gray-800">Emergency Radar</h1>
                <div className="w-8" />
            </header>

            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                    {/* Radar animation */}
                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-4 bg-red-100 rounded-full animate-ping opacity-75" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                    <div className="relative bg-white p-6 rounded-full shadow-lg z-10">
                        <MapPin className="w-16 h-16 text-red-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Help Fast</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                    Locate the nearest hospitals, pharmacies, and clinics based on your current GPS location.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 max-w-sm">
                        {error}
                    </div>
                )}

                {!location ? (
                    <button
                        onClick={getLocation}
                        disabled={loading}
                        className="w-full max-w-sm py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Locating...' : '📍 Locate Nearby Help'}
                    </button>
                ) : (
                    <div className="w-full max-w-sm grid gap-4 animate-in slide-in-from-bottom-4 fade-in">
                        <a
                            href={`https://www.google.com/maps/search/hospital/@${location.lat},${location.lng},14z`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-lg">
                                    <h3 className="text-xl">🏥</h3>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">Hospitals</div>
                                    <div className="text-sm text-gray-500">Emergency Care</div>
                                </div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                        </a>
                        <a
                            href={`https://www.google.com/maps/search/pharmacy/@${location.lat},${location.lng},14z`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <h3 className="text-xl">💊</h3>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">Pharmacies</div>
                                    <div className="text-sm text-gray-500">Medicine & Supplies</div>
                                </div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyFinder;
