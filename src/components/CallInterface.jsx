import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mic, MicOff, Video, VideoOff, MessageSquare, X, Volume2, VolumeX, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../hooks/useAI';
import { useSpeech } from '../hooks/useSpeech';

const CallInterface = () => {
    const navigate = useNavigate();
    const { messages, sendMessage, isLoading } = useAI();
    const { isListening, transcript, startListening, isSpeaking, speak, supported, setTranscript } = useSpeech();

    // Call States
    const [callState, setCallState] = useState('idle'); // idle, consenting, connecting, active, ended
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false); // Creating a fake video UI for now
    const [consentChecked, setConsentChecked] = useState(false);

    // Refs for handling conversation flow
    const lastMessageCount = useRef(messages.length);
    const hasSpokenGreeting = useRef(false);

    // Timer logic
    useEffect(() => {
        let interval;
        if (callState === 'active') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callState]);

    // Format timer
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Conversation Flow Logic ---

    // 1. Initial Greeting when Call Becomes Active
    useEffect(() => {
        if (callState === 'active' && !hasSpokenGreeting.current) {
            hasSpokenGreeting.current = true;
            // Speak the last message (which is usually the greeting)
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
                speak(lastMsg.text);
            }
        }
    }, [callState, messages, speak]);

    // 2. Handle User Speech Input
    useEffect(() => {
        if (transcript && !isListening) {
            // User finished speaking
            sendMessage(transcript);
            setTranscript(''); // Clear for next turn
        }
    }, [transcript, isListening, sendMessage, setTranscript]);

    // 3. Handle AI Response (Speak it)
    useEffect(() => {
        if (messages.length > lastMessageCount.current) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant') {
                speak(lastMsg.text);
            }
            lastMessageCount.current = messages.length;
        }
    }, [messages, speak]);

    // 4. Auto-Turn-Taking (Loop back to listening after AI finishes speaking)
    useEffect(() => {
        // If AI stopped speaking, and we are in active call, and not currently listening... start listening again.
        // We add a small delay to avoid cutting off reflection or breathing room.
        if (callState === 'active' && !isSpeaking && !isListening && !isLoading) {
            const timeout = setTimeout(() => {
                if (callState === 'active') { // Check again
                    startListening();
                }
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isSpeaking, isListening, isLoading, callState, startListening]);


    // Handlers
    const handleStartCall = () => {
        setCallState('connecting');
        setTimeout(() => {
            setCallState('active');
        }, 1500); // Fake connection delay
    };

    const handleEndCall = () => {
        setCallState('ended');
        setTimeout(() => {
            navigate('/');
        }, 2000);
    };

    // Render Components

    // Consent Modal
    if (callState === 'idle' || callState === 'consenting') {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Before we begin</h2>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                        <p className="text-sm text-yellow-800 leading-relaxed">
                            <strong>Disclaimer:</strong> I am an AI, not a real doctor. My advice is for informational purposes only. In case of a medical emergency, please call local emergency services immediately.
                        </p>
                    </div>

                    <label className="flex items-start gap-3 p-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors mb-8">
                        <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                            className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                        />
                        <span className="text-gray-600 text-sm">
                            I understand that this is an AI tool and accept the Terms of Service and Privacy Policy.
                        </span>
                    </label>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 py-4 text-gray-500 font-semibold hover:bg-gray-100 rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleStartCall}
                            disabled={!consentChecked}
                            className={`flex-1 py-4 rounded-full font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${consentChecked
                                    ? 'bg-green-600 hover:bg-green-700 hover:scale-105 shadow-green-200'
                                    : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            <Phone className="w-5 h-5 fill-current" />
                            Start Call
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Active Call Interface
    return (
        <div className="fixed inset-0 bg-white z-40 flex flex-col font-sans">
            {/* Top Bar */}
            <div className="h-20 flex items-center justify-between px-6">
                <div className="w-20">
                    {/* Placeholder for balance/layout */}
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">
                        {callState === 'connecting' ? 'Connecting...' : 'AI Doctor'}
                    </span>
                    <span className="text-2xl font-variant-numeric font-light text-gray-900">
                        {formatTime(duration)}
                    </span>
                </div>
                <div className="w-20 flex justify-end">
                    <button className="p-3 rounded-full hover:bg-gray-100 text-gray-500">
                        <Volume2 className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Content Area - Visualizer */}
            <div className="flex-grow flex flex-col items-center justify-center relative px-8">

                {/* Avatar / Waveform */}
                <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
                    {/* Ring Animations */}
                    {(isSpeaking || isListening) && (
                        <>
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-full border border-green-200"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }}
                                className="absolute inset-4 rounded-full border border-green-300"
                            />
                        </>
                    )}

                    <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center shadow-sm relative z-10 overflow-hidden">
                        {isVideoOn ? (
                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white/50 text-xs">camera</div>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center">
                                <Phone className="w-12 h-12 text-white fill-current" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Transcript Bubble */}
                <AnimatePresence mode="wait">
                    {(isSpeaking || transcript) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-md text-center"
                        >
                            <p className="text-2xl font-medium text-gray-800 leading-relaxed">
                                {isListening ? (transcript || "Listening...") : messages[messages.length - 1].text}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="h-32 bg-gray-50/50 backdrop-blur-sm px-6 pb-8 flex items-center justify-center gap-6">

                {/* Utility Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-red-500 shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={`hidden sm:flex p-4 rounded-full transition-all ${isVideoOn ? 'bg-white text-green-600 shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={() => navigate('/chat')}
                        className="p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all"
                    >
                        <MessageSquare className="w-6 h-6" />
                    </button>
                </div>

                {/* End Call Button */}
                <button
                    onClick={handleEndCall}
                    className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200 transition-transform hover:scale-105 active:scale-95 ml-4"
                >
                    <Phone className="w-8 h-8 text-white fill-current rotate-[135deg]" />
                </button>

            </div>
        </div>
    );
};

export default CallInterface;
