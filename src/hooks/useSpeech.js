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

    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Priority: Google US English (Standard, clear), then Samantha, then Zira
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
            voices.find(v => v.name === "Google US English") ||
            voices.find(v => v.name === "Samantha") ||
            voices.find(v => v.name === "Microsoft Zira Desktop");

        if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log("Using Voice:", preferredVoice.name);
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        // Gentle, clear, professional pace
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    }, []);

    return {
        isListening,
        transcript,
        setTranscript,
        startListening,
        isSpeaking,
        speak,
        supported
    };
};
