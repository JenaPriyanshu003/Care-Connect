import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Volume2, ArrowLeft, Settings, Phone, PhoneOff, User, Bot, AlertTriangle, Key, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAI } from '../hooks/useAI';
import { useSpeech } from '../hooks/useSpeech';
import { generatePDFReport } from '../utils/pdfGenerator';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = () => {
    const navigate = useNavigate();
    const { messages, sendMessage, isLoading, error, userApiKey, saveApiKey } = useAI();
    const { isListening, transcript, setTranscript, startListening, isSpeaking, speak, supported } = useSpeech();
    const [inputValue, setInputValue] = useState('');
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const messagesEndRef = useRef(null);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [tempKey, setTempKey] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update input when speech transcript changes
    useEffect(() => {
        if (transcript) {
            setInputValue(transcript);
        }
    }, [transcript]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
        setTranscript('');
    };

    // Auto-send in voice mode if silence? (Optional, kept simple for now)

    // Auto-save key
    const handleKeySave = () => {
        saveApiKey(tempKey);
        setShowKeyModal(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        AI Doctor
                    </span>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => generatePDFReport(messages)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                        title="Export Report"
                    >
                        <FileText className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowKeyModal(true)}
                        className={`p-2 rounded-full transition-colors ${!userApiKey ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* API Key Modal */}
            <AnimatePresence>
                {(!userApiKey || showKeyModal) && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4 text-amber-600">
                                <Key className="w-6 h-6" />
                                <h3 className="text-lg font-bold">API Key Required</h3>
                            </div>
                            <p className="text-gray-600 mb-4 text-sm">
                                To use the AI Doctor, you need a free Google Gemini API key.
                            </p>
                            <input
                                type="password"
                                placeholder="Paste Gemini API Key here"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                {userApiKey && (
                                    <button onClick={() => setShowKeyModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                )}
                                <button
                                    onClick={handleKeySave}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                                    disabled={!tempKey}
                                >
                                    Save Key
                                </button>
                            </div>
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="block mt-4 text-xs text-center text-blue-500 hover:underline">
                                Get a free key here →
                            </a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                        <Bot className="w-16 h-16 mb-2" />
                        <p>Start a conversation...</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                            ? 'bg-green-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                            }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            {msg.role === 'assistant' && (
                                <button
                                    onClick={() => speak(msg.text)}
                                    className="mt-2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    <Volume2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center">
                        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
                {/* Voice Animation Overlay */}
                <AnimatePresence>
                    {isListening && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-green-50 rounded-xl p-4 mb-4 flex flex-col items-center justify-center overflow-hidden"
                        >
                            <div className="flex items-center gap-1 h-8">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [10, 32, 10] }}
                                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                        className="w-1.5 bg-green-500 rounded-full"
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-green-700 font-medium mt-2">Listening...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-2">
                    <button
                        onClick={startListening}
                        className={`p-3 rounded-full transition-all ${isListening
                            ? 'bg-red-100 text-red-600 animate-pulse shadow-red-200'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                    >
                        {isListening ? <PhoneOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>

                    <div className="flex-grow relative">
                        <input
                            type="text"
                            className="w-full bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-green-500 rounded-2xl px-4 py-3 outline-none transition-all"
                            placeholder="Type or speak..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 transition-all active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
