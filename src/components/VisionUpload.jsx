import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, Upload, Bot, AlertTriangle, Send, Globe, ShieldCheck } from 'lucide-react';
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
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!image) return;

        setLoading(true);
        setError('');
        setAnalysis('');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Use stable flash for vision

            const base64Data = preview.split(',')[1];
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: image.type,
                },
            };

            const prompt = `You are a high-level Medical AI Consultant.
            
            STEP 1: VALIDATION
            Analyze the image. Use your best judgment to identify ANY possible medical relevance (e.g., skin conditions, medicines, wounds, medical reports, anatomy, or even general health concerns).
            Only return "INVALID_IMAGE" if the image is COMPLETELY unrelated (e.g., a car, a landscape, a meme, a video game).
            If you are unsure, proceed with the analysis.

            STEP 2: PROFESSIONAL ANALYSIS
            Provide a structured clinical report using markdown.
            
            ## 📋 Clinical Observation
            [Technical description of the visual symptoms or document summary. Use precise medical terminology followed by simple explanations.]

            ## 🔍 Potential Indications
            [List 2-3 potential causes or conditions based on visual evidence. Be objective.]

            ## 🛡️ Recommended Actions
            - [Immediate First Aid / Care steps]
            - [What to avoid]
            - [Over-the-counter options if applicable]

            ## 🚨 Urgency Assessment
            [Low/Medium/High severity estimation with reasoning. When to see a doctor immediately.]

            *Disclaimer: This analysis is AI-generated for informational purposes only and does not constitute a medical diagnosis.*`;

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            if (text.includes("INVALID_IMAGE")) {
                setError("This does not appear to be a medical image. Please upload a clear photo of a symptom or medical document.");
            } else {
                setAnalysis(text);
            }
        } catch (err) {
            console.error(err);
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData.items;
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    setImage(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setPreview(reader.result);
                    reader.readAsDataURL(file);
                    setAnalysis('');
                    setError('');
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    return (
        <div className="h-screen bg-slate-950 flex flex-col font-sans overflow-hidden text-white selection:bg-green-500 selection:text-white">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <header className="relative z-10 bg-slate-950/80 backdrop-blur-md px-8 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
                <button
                    onClick={() => navigate('/')}
                    className="p-2.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center text-white">
                        <Camera className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white text-lg tracking-tight">Vision Diagnosis</span>
                </div>
                <div className="w-10" />
            </header>

            <div className="relative z-10 flex-1 overflow-hidden p-6 md:p-10 flex items-center justify-center">
                {!preview ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl"
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">AI Medical Analysis</h2>
                            <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                                Upload a photo of a physical symptom or a medical report. Our AI will analyze it instantly.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-black/20 border border-white/10 p-8 overflow-hidden">
                            <div
                                className="group relative border-2 border-dashed border-white/10 hover:border-green-500/50 rounded-3xl bg-white/5 min-h-[320px] flex flex-col items-center justify-center gap-6 transition-all duration-500 hover:bg-white/10 cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

                                <div className="relative w-24 h-24 bg-slate-800 rounded-full shadow-xl shadow-black/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-transparent rounded-full opacity-50" />
                                    <Camera className="w-10 h-10 text-green-400 relative z-10" />
                                </div>

                                <div className="relative text-center space-y-2 z-10">
                                    <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                                        Drag & Drop or Paste Image
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium">Ctrl+V also works! (Max 10MB)</p>
                                </div>

                                <button className="relative z-10 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-semibold shadow-lg shadow-green-900/20 transition-all hover:translate-y-[-2px] active:translate-y-0">
                                    Select File
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-xs font-medium text-slate-500 mt-8 flex items-center justify-center gap-2">
                            <ShieldCheck className="w-3 h-3" />
                            HIPAA Compliant • End-to-End Encrypted • Private
                        </p>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </motion.div>
                ) : (
                    <div className="w-full h-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-stretch">
                        {/* Preview Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="w-full md:w-1/2 flex flex-col"
                        >
                            <div className="relative flex-1 bg-black rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 group border border-white/10">
                                <img src={preview} alt="Upload" className="w-full h-full object-contain opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <button
                                    onClick={() => { setPreview(null); setImage(null); setAnalysis(''); setError(''); }}
                                    className="absolute top-6 left-6 bg-black/40 backdrop-blur-md text-white p-3 rounded-full hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all border border-white/10"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>

                            {!analysis && !loading && (
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                    onClick={analyzeImage}
                                    className="mt-6 w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl font-bold text-xl shadow-xl shadow-green-900/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Bot className="w-6 h-6" />
                                    Analyze Diagnosis
                                </motion.button>
                            )}
                            {loading && (
                                <div className="mt-6 bg-slate-900/80 backdrop-blur p-8 rounded-2xl shadow-lg border border-white/10 text-center">
                                    <div className="flex items-center justify-center gap-4 text-white font-bold text-xl animate-pulse">
                                        <div className="w-6 h-6 border-[3px] border-slate-700 border-t-green-500 rounded-full animate-spin" />
                                        Running Analysis...
                                    </div>
                                    <p className="text-slate-400 mt-2 font-medium">Identifying symptoms & generating report</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Analysis Panel */}
                        <motion.div
                            className="w-full md:w-1/2 flex flex-col"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        >
                            {(analysis || error) && (
                                <div className="h-full bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-black/20 border border-white/10 overflow-hidden flex flex-col">
                                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                                        <h3 className={`flex items-center gap-3 font-bold text-xl ${error ? 'text-red-400' : 'text-white'}`}>
                                            {error ? <AlertTriangle className="w-6 h-6" /> : <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center"><Bot className="w-5 h-5" /></div>}
                                            {error ? 'Analysis Failed' : 'Medical Assessment'}
                                        </h3>
                                        {!error && <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full uppercase tracking-wide border border-green-500/20">AI Generated</span>}
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                        {error ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                                                    <AlertTriangle className="w-10 h-10 text-red-500" />
                                                </div>
                                                <h4 className="text-2xl font-bold text-white mb-3">
                                                    {error.includes("not appear to be a medical image") ? "Non-Medical Image Detected" : "Analysis Error"}
                                                </h4>
                                                <p className="text-slate-400 leading-relaxed max-w-xs mx-auto mb-8 break-words text-sm font-mono bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>
                                                <button
                                                    onClick={() => { setPreview(null); setImage(null); setError(''); }}
                                                    className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                                                >
                                                    Upload New Photo
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="prose prose-invert prose-lg px-2 max-w-none">
                                                {analysis.split('\n').map((line, index) => {
                                                    // Headers (## Title)
                                                    if (line.startsWith('##')) {
                                                        const title = line.replace(/##\s*/, '').replace(/\*/g, '');
                                                        return (
                                                            <h3 key={index} className="text-lg font-bold text-white mt-6 mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
                                                                <span className="w-1 h-6 bg-green-500 rounded-full inline-block mr-2"></span>
                                                                {title}
                                                            </h3>
                                                        );
                                                    }
                                                    // List Items (- item)
                                                    if (line.trim().startsWith('-')) {
                                                        const content = line.replace(/-\s*/, '').replace(/\*/g, '');
                                                        return (
                                                            <div key={index} className="flex items-start gap-3 mb-3 ml-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2.5 shrink-0" />
                                                                <p className="text-slate-300 leading-relaxed">{content}</p>
                                                            </div>
                                                        );
                                                    }
                                                    // Bold Key-Value (e.g. **Diagnosis:** Flu)
                                                    if (line.includes('**')) {
                                                        const parts = line.split('**');
                                                        return (
                                                            <p key={index} className="text-slate-300 mb-2 leading-relaxed">
                                                                {parts.map((part, i) => (
                                                                    i % 2 === 1 ? <span key={i} className="font-bold text-white">{part}</span> : part
                                                                ))}
                                                            </p>
                                                        );
                                                    }
                                                    // Empty lines
                                                    if (!line.trim()) return <div key={index} className="h-2" />;

                                                    // Regular text
                                                    return <p key={index} className="text-slate-300 mb-2 leading-relaxed">{line}</p>;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {!error && (
                                        <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                                            <p className="text-xs text-slate-500 font-medium">
                                                Disclaimer: This tool provides information, not medical advice. Consult a professional.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisionUpload;
