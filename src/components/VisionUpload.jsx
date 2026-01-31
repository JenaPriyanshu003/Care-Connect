import React, { useState, useRef } from 'react';
import { Camera, ArrowLeft, Upload, Bot, AlertTriangle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion } from 'framer-motion';

const VisionUpload = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            setAnalysis('');
            setError('');
        }
    };

    const analyzeImage = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBX0zOG_JGmS7nsmbLqBk4LqYbNaqsWiDo";

        if (!image) return;

        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Use flash for vision

            // Convert base64 to parts
            const base64Data = preview.split(',')[1];
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: image.type,
                },
            };

            const prompt = "Act as a Travel Doctor. Analyze this medical image (rash, bite, medicine label, etc.). Provide: 1) Identification (What might it be?), 2) Immediate Advice (First aid), 3) Disclaimer (Not professional medical advice). Keep it concise.";

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            setAnalysis(response.text());
        } catch (err) {
            console.error(err);
            setError('Analysis failed. Try a clear photo or check your API key.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white px-4 py-3 border-b flex items-center justify-between shadow-sm">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <h1 className="font-bold text-gray-800">Vision Diagnosis</h1>
                <div className="w-8" />
            </header>

            <div className="flex-grow p-6 max-w-md mx-auto w-full flex flex-col items-center">
                {!preview ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-white rounded-2xl p-8 shadow-sm border border-dashed border-gray-300 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:bg-gray-50 hover:border-green-400 transition-all py-16"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <Camera className="w-10 h-10 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Upload Photo</h3>
                            <p className="text-sm text-gray-500 mt-1">Rash, bug bite, or medicine label</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </motion.div>
                ) : (
                    <div className="w-full flex flex-col gap-6">
                        <div className="relative rounded-2xl overflow-hidden shadow-md">
                            <img src={preview} alt="Upload" className="w-full h-64 object-cover" />
                            <button
                                onClick={() => { setPreview(null); setImage(null); setAnalysis(''); }}
                                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                            >
                                ✕
                            </button>
                        </div>

                        {!analysis && !loading && (
                            <button
                                onClick={analyzeImage}
                                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Bot className="w-5 h-5" />
                                Analyze with AI
                            </button>
                        )}

                        {loading && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3" />
                                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                                <p className="text-sm text-green-600 mt-4 font-medium">Analyzing image...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 p-4 rounded-xl text-red-600 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {analysis && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-green-100"
                            >
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-green-600" />
                                    AI Assessment
                                </h3>
                                <div className="prose prose-sm prose-green text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {analysis}
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisionUpload;
