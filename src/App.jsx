import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import CallInterface from './components/CallInterface';
import VisionUpload from './components/VisionUpload';
import EmergencyFinder from './components/EmergencyFinder';

import MedicationTracker from './components/MedicationTracker';
import HowItWorks from './components/HowItWorks';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-950 text-white font-sans">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/chat" element={<ChatInterface />} />
                    <Route path="/call" element={<CallInterface />} />
                    <Route path="/vision" element={<VisionUpload />} />
                    <Route path="/emergency" element={<EmergencyFinder />} />

                    <Route path="/meds" element={<MedicationTracker />} />
                </Routes>
                <Toaster position="bottom-center" />
            </div>
        </Router>
    );
}

export default App;
