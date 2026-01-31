import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Globe, Clock, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-primary fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">Care-Connect</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</a>
                        <button onClick={() => navigate('/how-it-works')} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">How it works</button>
                    </nav>

                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-24 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white -z-10" />
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100/80 text-primary text-xs font-semibold mb-8 uppercase tracking-wider animate-in fade-in zoom-in duration-500">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Trusted AI Medical Assistant
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
                            Your Personal AI Doctor <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">Anywhere, Anytime.</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
                            Instant medical guidance in 100+ languages. Talk naturally via voice or text. Get accurate advice, symptom checks, and SBAR reports instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                            <button
                                onClick={() => navigate('/chat')}
                                className="group relative w-full sm:w-auto px-8 py-4 bg-primary hover:bg-green-700 text-white rounded-full font-bold text-lg shadow-xl shadow-green-200 transition-all hover:scale-105 active:scale-95"
                            >
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                                <span className="relative flex items-center justify-center gap-2">
                                    Start Consultation
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                            {/* New Call Feature Button */}
                            <button
                                onClick={() => navigate('/call')}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-green-100 hover:border-green-300 rounded-full font-bold text-lg transition-all hover:bg-green-50 hover:scale-105 flex items-center justify-center gap-3 shadow-lg shadow-gray-100"
                            >
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                </div>
                                Call AI Doctor
                            </button>
                            </button>
                        </div>

                        <p className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            </span>
                            100% Free • No Signup Required • Privacy Focused
                        </p>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Globe className="w-6 h-6 text-primary" />}
                                title="Multilingual Support"
                                description="Speak in your native language. Our AI understands and speaks 100+ languages fluently."
                            />
                            <FeatureCard
                                icon={<Clock className="w-6 h-6 text-primary" />}
                                title="24/7 Availability"
                                description="Medical advice whenever you need it. No waiting rooms, no appointments, just instant help."
                            />
                            <FeatureCard
                                icon={<FileText className="w-6 h-6 text-primary" />}
                                title="SBAR Reports"
                                description="Generate professional reports to share with real doctors for faster, more accurate treatment."
                            />
                        </div>
                    </div>
                </section>



                {/* Advanced Features Teaser */}<section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold mb-12">All-in-One Travel Health Super-App</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <SmallFeatureCard title="Vision Diagnosis" icon="📸" link="/vision" />
                            <SmallFeatureCard title="Emergency Finder" icon="🏥" link="/emergency" />
                            <SmallFeatureCard title="Travel Cards" icon="🗣️" link="/cards" />
                            <SmallFeatureCard title="Pill Tracker" icon="💊" link="/meds" />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-white">Care-Connect</span>
                    </div>
                    <div className="text-sm">
                        © 2026 Care Connect. All rights reserved.
                    </div>
                </div>
            </footer>
        </div >
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const SmallFeatureCard = ({ icon, title, link }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(link)}
            className="p-6 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all group"
        >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <div className="font-semibold text-gray-900">{title}</div>
        </div>
    )
}

const StepCard = ({ number, title, description }) => (
    <div className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-green-100/50 text-center group hover:-translate-y-2 transition-transform duration-300">
        <div className="w-16 h-16 mx-auto bg-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-green-600/30 group-hover:scale-110 transition-transform">
            {number}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
