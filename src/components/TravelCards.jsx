import React, { useState } from 'react';
import { ArrowLeft, Globe, Volume2, Type, Loader2, AlertTriangle } from 'lucide-react';
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

    const LANGUAGES = ['Spanish', 'French', 'German', 'Italian', 'Japanese', 'Chinese (Mandarin)', 'Arabic', 'Thai', 'Vietnamese', 'Portuguese', 'Hindi'];

    const generateCard = async () => {
        if (!inputText.trim()) return;

        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            setError('Please save your API Key in the Chat Settings first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `Translate the following medical/emergency phrase into ${targetLang}. Return ONLY the translated text, nothing else. Phrase: "${inputText}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const translation = response.text();

            setCardData({
                original: inputText,
                translated: translation,
                language: targetLang
            });
        } catch (err) {
            console.error(err);
            setError('Translation failed. Please check your API key or internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        // Note: setting specific voice/lang for TTS is complex across browsers, keeping default for MVP
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white px-4 py-3 border-b flex items-center justify-between shadow-sm">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <h1 className="font-bold text-gray-800">Travel Cards</h1>
                <div className="w-8" />
            </header>

            <div className="flex-grow p-4 max-w-lg mx-auto w-full flex flex-col gap-6">

                {/* Input Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">What do you need to say?</label>
                    <textarea
                        className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-green-500 outline-none resize-none text-lg"
                        rows={3}
                        placeholder="e.g. I am allergic to peanuts"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />

                    <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex-grow">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Translate to</label>
                            <select
                                className="w-full p-2 bg-gray-100 rounded-lg font-medium outline-none"
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                            >
                                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={generateCard}
                            disabled={loading || !inputText}
                            className="h-12 px-6 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 mt-5 transition-transform active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Card'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Card Display */}
                <AnimatePresence mode="wait">
                    {cardData && (
                        <motion.div
                            key={cardData.translated}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative"
                        >
                            <div className="bg-green-600 px-6 py-4 text-white flex justify-between items-center">
                                <span className="font-bold flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    {cardData.language}
                                </span>
                                <button onClick={() => speak(cardData.translated)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                                <p className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                                    {cardData.translated}
                                </p>
                                <div className="h-px w-16 bg-gray-200 my-4" />
                                <p className="text-gray-500 font-medium">
                                    "{cardData.original}"
                                </p>
                            </div>

                            <div className="bg-gray-50 px-6 py-3 text-center">
                                <p className="text-xs text-gray-400">Show this screen to a local</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TravelCards;
