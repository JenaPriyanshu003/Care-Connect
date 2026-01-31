import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mic, MicOff, Video, VideoOff, MessageSquare, Volume2, FileText, Download, X, ArrowLeft, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../hooks/useAI';
import { useSpeech } from '../hooks/useSpeech';
import { jsPDF } from 'jspdf';

const CallInterface = () => {
    const navigate = useNavigate();
    const { messages, sendMessage, isLoading } = useAI();
    const { isListening, transcript, startListening, isSpeaking, speak, supported, setTranscript } = useSpeech();

    // Call States
    const [callState, setCallState] = useState('idle'); // idle, consenting, connecting, active, ending, ended
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [consentChecked, setConsentChecked] = useState(false);

    // Report State
    const [showEndModal, setShowEndModal] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportData, setReportData] = useState(null);

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
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
                speak(lastMsg.text);
            }
        }
    }, [callState, messages, speak]);

    // 2. Handle User Speech Input
    useEffect(() => {
        if (transcript && !isListening) {
            sendMessage(transcript);
            setTranscript('');
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

    // 4. Auto-Turn-Taking
    useEffect(() => {
        if (callState === 'active' && !isSpeaking && !isListening && !isLoading) {
            const timeout = setTimeout(() => {
                if (callState === 'active') {
                    startListening();
                }
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isSpeaking, isListening, isLoading, callState, startListening]);

    // Sound Refs
    const ringAudioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3'));
    const hangupAudioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

    // Generate SBAR Report from conversation
    const generateSBARReport = () => {
        const userMessages = messages.filter(m => m.role === 'user').map(m => m.text);
        const aiMessages = messages.filter(m => m.role === 'assistant').map(m => m.text);

        // Extract key information from conversation
        const situation = userMessages.length > 0
            ? userMessages[0]
            : "Patient initiated consultation with AI Doctor.";

        const background = userMessages.slice(1, 3).join(' ') || "No additional background provided.";

        const assessment = aiMessages.length > 1
            ? aiMessages.slice(-2).join(' ').substring(0, 500)
            : "AI assessment based on described symptoms.";

        const recommendation = aiMessages.length > 0
            ? aiMessages[aiMessages.length - 1].substring(0, 500)
            : "Continue monitoring symptoms and consult a healthcare provider if symptoms persist.";

        return {
            situation,
            background,
            assessment,
            recommendation,
            duration: formatTime(duration),
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            messageCount: messages.length
        };
    };

    // Download PDF Report
    const downloadReport = () => {
        setIsGeneratingReport(true);

        const report = reportData || generateSBARReport();
        const doc = new jsPDF();

        // Header
        doc.setFillColor(16, 185, 129); // Green
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Care Connect', 20, 22);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('AI Health Consultation Report', 20, 30);

        // Date and Duration
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Date: ${report.date}`, 140, 22);
        doc.text(`Duration: ${report.duration}`, 140, 28);

        // SBAR Sections
        let yPos = 50;
        const sections = [
            { title: 'S - Situation', content: report.situation, color: [239, 68, 68] },
            { title: 'B - Background', content: report.background, color: [59, 130, 246] },
            { title: 'A - Assessment', content: report.assessment, color: [245, 158, 11] },
            { title: 'R - Recommendation', content: report.recommendation, color: [16, 185, 129] }
        ];

        sections.forEach(section => {
            // Section Header
            doc.setFillColor(...section.color);
            doc.rect(15, yPos - 5, 180, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(section.title, 20, yPos + 2);

            // Section Content
            yPos += 15;
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const lines = doc.splitTextToSize(section.content, 170);
            doc.text(lines, 20, yPos);
            yPos += lines.length * 5 + 15;
        });

        // Disclaimer
        yPos += 10;
        doc.setFillColor(254, 243, 199);
        doc.rect(15, yPos - 5, 180, 25, 'F');
        doc.setTextColor(146, 64, 14);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('DISCLAIMER', 20, yPos + 2);
        doc.setFont('helvetica', 'normal');
        const disclaimer = 'This report is generated by an AI assistant and is not a medical diagnosis. Please share this report with a licensed healthcare provider for professional medical advice.';
        const disclaimerLines = doc.splitTextToSize(disclaimer, 170);
        doc.text(disclaimerLines, 20, yPos + 10);

        // Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text('Generated by Care Connect AI | Not a substitute for professional medical advice', 105, 285, { align: 'center' });

        // Save
        doc.save(`CareConnect_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsGeneratingReport(false);
    };

    // Handlers
    const handleStartCall = () => {
        setCallState('connecting');
        ringAudioRef.current.loop = true;
        ringAudioRef.current.play().catch(e => console.log('Audio play failed', e));

        setTimeout(() => {
            ringAudioRef.current.pause();
            ringAudioRef.current.currentTime = 0;
            setCallState('active');
        }, 3000);
    };

    const handleEndCall = () => {
        // Stop speech
        window.speechSynthesis.cancel();
        ringAudioRef.current.pause();

        // Generate report data
        setReportData(generateSBARReport());

        // Show end modal
        setShowEndModal(true);
    };

    const handleEndWithoutReport = () => {
        hangupAudioRef.current.play().catch(e => console.log('Audio play failed', e));
        setCallState('ended');
        setTimeout(() => navigate('/'), 1000);
    };

    const handleContinueCall = () => {
        setShowEndModal(false);
        startListening();
    };

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

    // End Consultation Modal
    if (showEndModal) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">End Consultation</h2>
                            <p className="text-gray-500 text-sm">Would you like to download a summary report?</p>
                        </div>
                    </div>

                    {/* Report Preview */}
                    {reportData && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-semibold text-red-600">Situation: </span>
                                    <span className="text-gray-700">{reportData.situation.substring(0, 100)}...</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-blue-600">Assessment: </span>
                                    <span className="text-gray-700">{reportData.assessment.substring(0, 100)}...</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-green-600">Recommendation: </span>
                                    <span className="text-gray-700">{reportData.recommendation.substring(0, 100)}...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Share Notice */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Share2 className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-blue-800 text-sm">Share with your healthcare provider</p>
                                <p className="text-blue-700 text-xs mt-1">
                                    This SBAR report can help your doctor understand your symptoms quickly.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={downloadReport}
                            disabled={isGeneratingReport}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-green-200"
                        >
                            <Download className="w-5 h-5" />
                            {isGeneratingReport ? 'Generating...' : 'Download SBAR Report (PDF)'}
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={handleContinueCall}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-colors"
                            >
                                Continue Consultation
                            </button>
                            <button
                                onClick={handleEndWithoutReport}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 font-semibold rounded-full transition-colors"
                            >
                                End Without Report
                            </button>
                        </div>
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
                                {isListening ? (transcript || "Listening...") : messages[messages.length - 1]?.text}
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
