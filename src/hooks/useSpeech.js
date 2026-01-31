
import { useState, useEffect, useCallback } from 'react';

export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupported(false);
        }
    }, []);

    const startListening = useCallback(() => {
        if (!supported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Could handle language switching here

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
        };

        recognition.start();
    }, [supported]);

    const [voices, setVoices] = useState([]);

    useEffect(() => {
        const updateVoices = () => {
            const output = window.speechSynthesis.getVoices();
            console.log("Detailed Voices Check:", output.length > 0 ? output.length + " voices found" : "No voices yet");
            if (output.length > 0) {
                setVoices(output);
            }
        };

        // Browsers load voices asynchronously
        window.speechSynthesis.onvoiceschanged = updateVoices;

        // Initial check
        updateVoices();

        // Polling fallback
        const interval = setInterval(() => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setVoices(voices);
                clearInterval(interval);
            }
        }, 500);

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            clearInterval(interval);
        };
    }, []);

    const speak = useCallback((text, selectedVoiceName = null, pitch = 1.1, rate = 0.95) => {
        // Stop any current audio
        window.speechSynthesis.cancel();

        // Browser Web Speech API (Free & Universal)
        if (!('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const availableVoices = window.speechSynthesis.getVoices();

        let preferredVoice;

        if (selectedVoiceName) {
            preferredVoice = availableVoices.find(v => v.name === selectedVoiceName);
        }

        if (!preferredVoice) {
            // Priority Cascade for "Dr. Care" Female Voice
            // Google voices (Chrome) are best, then natural-sounding Apple voices
            preferredVoice =
                availableVoices.find(v => v.name === "Google US English") || // Chrome Best (sounds female)
                availableVoices.find(v => v.name === "Google UK English Female") || // Explicitly female
                availableVoices.find(v => v.name === "Karen") || // Mac - Australian, more natural
                availableVoices.find(v => v.name === "Moira") || // Mac - Irish, soft
                availableVoices.find(v => v.name.includes("Microsoft Zira")) || // Windows
                availableVoices.find(v => v.name.toLowerCase().includes("female")) ||
                availableVoices.find(v => v.lang === "en-US" && v.name.includes("Google")) ||
                availableVoices.find(v => v.name === "Samantha") || // Mac Default (last resort)
                availableVoices.find(v => v.lang.startsWith("en")); // Any English
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log("Using Voice:", preferredVoice.name);
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech Error:", e);
            setIsSpeaking(false);
        };

        // Tuning for "Caring Doctor" Persona
        utterance.pitch = pitch;
        utterance.rate = rate; // Slightly slower is more calming

        window.speechSynthesis.speak(utterance);
    }, []);

    return {
        isListening,
        transcript,
        setTranscript,
        startListening,
        isSpeaking,
        speak,
        supported,
        voices
    };
};
