import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Globe, Clock, FileText, ArrowRight, ShieldCheck, Menu, X, Camera, Navigation, Pill } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white font-sans selection:bg-green-500 selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300">
                            <Heart className="w-6 h-6 text-white fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white group-hover:text-green-400 transition-colors">Care-Connect</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
                            <button onClick={() => navigate('/how-it-works')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it works</button>
                        </nav>

                        {/* Menu Button */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-4 w-72 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden"
                                    >
                                        <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Health Tools</div>
                                        <MenuItem
                                            icon={<Camera className="w-4 h-4 text-blue-400" />}
                                            title="Vision Diagnosis"
                                            onClick={() => navigate('/vision')}
                                        />
                                        <MenuItem
                                            icon={<Navigation className="w-4 h-4 text-red-400" />}
                                            title="Emergency Finder"
                                            onClick={() => navigate('/emergency')}
                                        />
                                        <MenuItem
                                            icon={<Pill className="w-4 h-4 text-green-400" />}
                                            title="Medication Tracker"
                                            onClick={() => navigate('/meds')}
                                        />

                                        <div className="h-px bg-white/10 my-1" />

                                        <div className="md:hidden">
                                            <MenuItem title="Features" onClick={() => { setIsMenuOpen(false); window.location.href = '#features'; }} />
                                            <MenuItem title="How it Works" onClick={() => navigate('/how-it-works')} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-32 pb-40 overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-green-500/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -z-10 opacity-30 pointer-events-none" />

                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-green-400 text-xs font-bold mb-8 uppercase tracking-wider hover:bg-white/10 transition-colors cursor-default animate-in fade-in zoom-in duration-700">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Trusted AI Medical Assistant
                        </div>

                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight mb-8 animate-in slide-in-from-bottom-8 fade-in duration-1000">
                            Your Personal <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">AI Doctor.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 font-light">
                            Instant medical guidance in <span className="text-white font-medium">100+ languages</span>. Talk naturally via voice or text. Get accurate advice, symptom checks, and SBAR reports instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
                            <button
                                onClick={() => navigate('/chat')}
                                className="group relative w-full sm:w-auto px-8 py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span className="relative flex items-center justify-center gap-3">
                                    Start Consultation
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                            {/* Call Feature Button */}
                            <button
                                onClick={() => navigate('/call')}
                                className="w-full sm:w-auto px-8 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 backdrop-blur-sm"
                            >
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                </div>
                                Call AI Doctor
                            </button>
                        </div>

                        <div className="mt-16 flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Simple trust indicators/logos could go here */}
                            <p className="text-sm text-slate-500 font-mono uppercase tracking-widest">Trusted Health Technology</p>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-32 bg-slate-900 border-t border-white/5 relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-900 to-transparent" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Medical Intelligence</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Powered by advanced AI models to provide instant, reliable support.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Globe className="w-8 h-8 text-green-400" />}
                                title="Multilingual Support"
                                description="Speak in your native language. Our AI understands and speaks 100+ languages fluently."
                            />
                            <FeatureCard
                                icon={<Clock className="w-8 h-8 text-blue-400" />}
                                title="24/7 Availability"
                                description="Medical advice whenever you need it. No waiting rooms, no appointments, just instant help."
                            />
                            <FeatureCard
                                icon={<FileText className="w-8 h-8 text-purple-400" />}
                                title="SBAR Reports"
                                description="Generate professional reports to share with real doctors for faster, more accurate treatment."
                            />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-black text-slate-500 py-16 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-white">Care-Connect</span>
                    </div>
                    <div className="text-sm font-medium">
                        © 2026 Care Connect. Secured with AI.
                    </div>
                </div>
            </footer>
        </div >
    );
};

const MenuItem = ({ icon, title, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all text-left group"
    >
        {icon && <div className="group-hover:scale-110 transition-transform">{icon}</div>}
        <span className="font-medium">{title}</span>
    </button>
);

const FeatureCard = ({ icon, title, description }) => (
    <div className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 backdrop-blur-sm">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-lg">{description}</p>
    </div>
);

export default LandingPage;
