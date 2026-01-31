import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Volume2, Type, Loader2, AlertTriangle, Save, Trash2, Maximize2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';

const TravelCards = () => {
    const navigate = useNavigate();
    const [inputText, setInputText] = useState('');
    const [targetLang, setTargetLang] = useState('Spanish');
    const [cardData, setCardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [savedCards, setSavedCards] = useState([]);
    const [showFullscreen, setShowFullscreen] = useState(false);

    // BCP 47 tags for better TTS
    const LANGUAGES = [
        { name: 'Spanish', code: 'es-ES' },
        { name: 'French', code: 'fr-FR' },
        { name: 'German', code: 'de-DE' },
        { name: 'Italian', code: 'it-IT' },
        { name: 'Japanese', code: 'ja-JP' },
        { name: 'Chinese (Mandarin)', code: 'zh-CN' },
        { name: 'Arabic', code: 'ar-SA' },
        { name: 'Thai', code: 'th-TH' },
        { name: 'Vietnamese', code: 'vi-VN' },
        { name: 'Portuguese', code: 'pt-PT' },
        { name: 'Hindi', code: 'hi-IN' }
    ];

    const QUICK_PHRASES = [
        "I have a severe nut allergy.",
        "Where is the nearest hospital?",
        "I need a doctor who speaks English.",
        "I have diabetes and need insulin.",
        "Please call an ambulance.",
        "I lost my passport."
    ];

    useEffect(() => {
        try {
            const saved = localStorage.getItem('care_connect_cards');
            if (saved) {
                setSavedCards(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Failed to load saved cards:", error);
            localStorage.removeItem('care_connect_cards'); // Clear bad data
        }
    }, []);

    const saveCard = (card) => {
        const newCards = [card, ...savedCards.filter(c => c.translated !== card.translated)].slice(0, 10);
        setSavedCards(newCards);
        localStorage.setItem('care_connect_cards', JSON.stringify(newCards));
    };

    const deleteCard = (index, e) => {
        e.stopPropagation();
        const newCards = savedCards.filter((_, i) => i !== index);
        setSavedCards(newCards);
        localStorage.setItem('care_connect_cards', JSON.stringify(newCards));
    };

    const generateCard = async () => {
        if (!inputText.trim()) return;

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            setError('API Key missing. Please check your .env file.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `Translate the following medical/emergency phrase into ${targetLang}. Return ONLY the translated text, nothing else. Phrase: "${inputText}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const translation = response.text();

            const newCard = {
                original: inputText,
                translated: translation,
                language: targetLang,
                langCode: LANGUAGES.find(l => l.name === targetLang)?.code || 'en-US',
                timestamp: Date.now()
            };

            setCardData(newCard);
            saveCard(newCard);
        } catch (err) {
            console.error(err);
            setError(`Translation failed: ${err.message || 'Check API key/connection'}`);
        } finally {
            setLoading(false);
        }
    };

    const speak = (text, langCode) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 0.9; // Slightly slower for clarity
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 py-3 border-b flex items-center justify-between shadow-sm">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <h1 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    Travel Mode
                </h1>
                <div className="w-8" />
            </header>

            <main className="flex-grow p-4 max-w-2xl mx-auto w-full flex flex-col gap-6">

                {/* Main Input Card */}
                <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Type className="w-4 h-4 text-green-600" />
                        Enter Medical Condition or Need
                    </label>

                    <textarea
                        className="w-full p-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-green-500 outline-none resize-none text-lg transition-all"
                        rows={3}
                        placeholder="e.g. I am allergic to peanuts..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />

                    {/* Quick Phrases */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {QUICK_PHRASES.map((phrase) => (
                            <button
                                key={phrase}
                                onClick={() => setInputText(phrase)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-green-50 hover:text-green-700 text-xs text-gray-600 rounded-full transition-colors font-medium border border-transparent hover:border-green-200"
                            >
                                {phrase}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:flex-1">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Translate to</label>
                            <div className="relative">
                                <select
                                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-semibold outline-none appearance-none cursor-pointer transition-colors"
                                    value={targetLang}
                                    onChange={(e) => setTargetLang(e.target.value)}
                                >
                                    {LANGUAGES.map(lang => <option key={lang.name} value={lang.name}>{lang.name}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                            </div>
                        </div>
                        <button
                            onClick={generateCard}
                            disabled={loading || !inputText}
                            className="w-full sm:w-auto h-12 px-8 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    <span>Translate</span>
                                    <Globe className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Active Card Dispay */}
                <AnimatePresence mode="wait">
                    {cardData && (
                        <motion.div
                            key={cardData.translated + cardData.timestamp}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[2rem] shadow-2xl shadow-green-900/10 border border-green-100 overflow-hidden relative group"
                        >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white flex justify-between items-center">
                                <span className="font-bold flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    <Globe className="w-3 h-3" />
                                    {cardData.language}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowFullscreen(true)}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        title="Fullscreen"
                                    >
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => speak(cardData.translated, cardData.langCode)}
                                        className="p-2 bg-white text-green-700 rounded-full hover:scale-105 transition-transform shadow-lg"
                                        title="Speak Aloud"
                                    >
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
                                <p className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6 select-all">
                                    {cardData.translated}
                                </p>
                                <div className="h-px w-24 bg-gray-100 my-4" />
                                <p className="text-gray-400 font-medium text-lg">
                                    "{cardData.original}"
                                </p>
                            </div>

                            {/* Footer hint */}
                            <div className="bg-gray-50/50 px-6 py-3 text-center border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Show this to a medical professional</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Saved Cards Section */}
                {savedCards.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 px-2 flex items-center gap-2">
                            <Save className="w-5 h-5 text-gray-400" />
                            Saved Cards
                        </h3>
                        <div className="grid gap-3">
                            <AnimatePresence>
                                {savedCards.map((card, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        onClick={() => setCardData(card)}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all cursor-pointer flex justify-between items-center group"
                                    >
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-gray-800 truncate">{card.original}</p>
                                            <p className="text-xs text-green-600 font-medium">{card.language} • {card.translated.substring(0, 30)}...</p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteCard(index, e)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </main>

            {/* Fullscreen Overlay */}
            <AnimatePresence>
                {showFullscreen && cardData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-white flex flex-col"
                    >
                        <div className="p-4 flex justify-end">
                            <button onClick={() => setShowFullscreen(false)} className="p-4 bg-gray-100 rounded-full">
                                <X className="w-8 h-8 text-gray-800" />
                            </button>
                        </div>
                        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center -mt-20">
                            <p className="text-6xl md:text-8xl font-black text-gray-900 leading-tight mb-12">
                                {cardData.translated}
                            </p>
                            <button
                                onClick={() => speak(cardData.translated, cardData.langCode)}
                                className="px-8 py-4 bg-green-600 text-white rounded-full font-bold text-xl flex items-center gap-3 shadow-xl hover:scale-105 transition-transform"
                            >
                                <Volume2 className="w-8 h-8" />
                                Play Audio
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TravelCards;
