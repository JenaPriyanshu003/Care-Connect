import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Camera, Navigation, FileText, Heart, ShieldCheck, Zap, Mic, Globe2, Brain, CheckSquare, Stethoscope, Share2 } from 'lucide-react';

const HowItWorks = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-green-500 selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-300" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">How Care-Connect Works</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-green-400 text-xs font-bold mb-8 uppercase tracking-wider">
                        <Brain className="w-3.5 h-3.5" />
                        Advanced AI Healthcare
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Your Journey to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Better Health.</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Experience a seamless healthcare journey powered by advanced AI. Here is exactly how to use every feature to its full potential.
                    </p>
                </div>

                <div className="space-y-32 relative">
                    {/* Connecting Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-green-500/0 via-green-500/20 to-green-500/0 hidden md:block" />

                    {/* Step 1: Chat */}
                    <Section
                        number="01"
                        title="AI Consultation"
                        subtitle="Start a natural conversation."
                        icon={<MessageSquare className="w-8 h-8 text-blue-400" />}
                        color="bg-blue-500/10 border-blue-500/20"
                        align="right"
                    >
                        <ul className="space-y-6 mt-6">
                            <FeatureItem
                                icon={<Mic className="w-5 h-5 text-blue-400" />}
                                title="Voice Mode"
                                desc="Tap the microphone and speak. We support 100+ languages with native-level understanding."
                            />
                            <FeatureItem
                                icon={<Brain className="w-5 h-5 text-blue-400" />}
                                title="Smart Analysis"
                                desc="The AI asks clarifying questions, checking your history and symptoms to avoid generic advice."
                            />
                            <FeatureItem
                                icon={<CheckSquare className="w-5 h-5 text-blue-400" />}
                                title="Instant Triage"
                                desc="Get immediate next steps: Home care, Pharmacy, or 'Go to ER immediately'."
                            />
                        </ul>
                    </Section>

                    {/* Step 2: Vision */}
                    <Section
                        number="02"
                        title="Vision Diagnosis"
                        subtitle="Pictures speak louder than words."
                        icon={<Camera className="w-8 h-8 text-purple-400" />}
                        color="bg-purple-500/10 border-purple-500/20"
                        align="left"
                    >
                        <ul className="space-y-6 mt-6">
                            <FeatureItem
                                icon={<Stethoscope className="w-5 h-5 text-purple-400" />}
                                title="Skin Analysis"
                                desc="Upload photos of rashes, bites, boils, or wounds. The AI analyzes visual patterns for potential matches."
                            />
                            <FeatureItem
                                icon={<FileText className="w-5 h-5 text-purple-400" />}
                                title="Lab Reports"
                                desc="Snap a picture of your blood test results. We translate medical jargon into plain English."
                            />
                        </ul>
                    </Section>

                    {/* Step 3: Location */}
                    <Section
                        number="03"
                        title="Emergency Finder"
                        subtitle="Help when you are far from home."
                        icon={<Navigation className="w-8 h-8 text-red-400" />}
                        color="bg-red-500/10 border-red-500/20"
                        align="right"
                    >
                        <ul className="space-y-6 mt-6">
                            <FeatureItem
                                icon={<Globe2 className="w-5 h-5 text-red-400" />}
                                title="Global Database"
                                desc="Instantly finds the nearest hospitals, clinics, and pharmacies anywhere in the world."
                            />
                            <FeatureItem
                                icon={<Zap className="w-5 h-5 text-red-400" />}
                                title="One-Click Navigation"
                                desc="No typing needed. Just one tap opens Google Maps with the fastest route to safety."
                            />
                        </ul>
                    </Section>

                    {/* Step 4: Report */}
                    <Section
                        number="04"
                        title="Export SBAR Report"
                        subtitle="Bridge the gap to real doctors."
                        icon={<FileText className="w-8 h-8 text-green-400" />}
                        color="bg-green-500/10 border-green-500/20"
                        align="left"
                    >
                        <ul className="space-y-6 mt-6">
                            <FeatureItem
                                icon={<FileText className="w-5 h-5 text-green-400" />}
                                title="Professional Format"
                                desc="Generates a standard SBAR (Situation, Background, Assessment, Recommendation) report."
                            />
                            <FeatureItem
                                icon={<Share2 className="w-5 h-5 text-green-400" />}
                                title="PDF Download"
                                desc="Save the entire consultation as a PDF. Hand it to a real doctor to save hours of explaining."
                            />
                        </ul>
                    </Section>
                </div>

                <div className="mt-32 text-center p-8 rounded-3xl bg-gradient-to-b from-green-900/20 to-slate-900 border border-green-500/20">
                    <h3 className="text-3xl font-bold mb-6">Ready to take control?</h3>
                    <button
                        onClick={() => navigate('/chat')}
                        className="bg-green-600 hover:bg-green-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-green-900/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
                    >
                        <Zap className="w-5 h-5" />
                        Start Free Consultation
                    </button>
                    <p className="mt-6 text-sm text-slate-500 uppercase tracking-widest font-mono">No login required • HIPAA Compliant</p>
                </div>
            </main>
        </div>
    );
};

const Section = ({ number, title, subtitle, icon, color, align, children }) => (
    <div className={`flex flex-col md:flex-row gap-12 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>

        {/* Visual/Number Side */}
        <div className="flex-1 flex justify-center">
            <div className={`relative w-40 h-40 md:w-56 md:h-56 rounded-full border-4 flex items-center justify-center ${color} bg-slate-900`}>
                <div className="absolute inset-0 bg-slate-950/50 rounded-full blur-xl -z-10" />
                <div className="text-center">
                    <div className="text-6xl font-black text-white/10 mb-2">{number}</div>
                    <div className="flex justify-center">{icon}</div>
                </div>
            </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 text-center md:text-left">
            <h3 className="text-4xl font-bold text-white mb-2">{title}</h3>
            <p className="text-xl text-green-400 mb-8 font-medium">{subtitle}</p>
            <div className="text-slate-300">
                {children}
            </div>
        </div>
    </div>
);

const FeatureItem = ({ icon, title, desc }) => (
    <li className="flex gap-4 items-start text-left p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
        <div className="mt-1 p-2 rounded-lg bg-white/5 shrink-0">{icon}</div>
        <div>
            <strong className="block text-white text-lg mb-1">{title}</strong>
            <span className="text-slate-400 leading-relaxed">{desc}</span>
        </div>
    </li>
);

export default HowItWorks;
