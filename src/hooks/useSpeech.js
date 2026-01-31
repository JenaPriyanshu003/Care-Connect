
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

    const speak = useCallback(async (text, selectedVoiceName = null, pitch = 1.1, rate = 0.95) => {
        // Stop any current audio
        window.speechSynthesis.cancel();

        // 1. Try ElevenLabs API First
        const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
        const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // "Bella" (Soft, American)

        if (ELEVEN_KEY) {
            try {
                // Determine model based on language (multilingual for non-English support if needed)
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': ELEVEN_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: "eleven_monolingual_v1", // Use 'eleven_multilingual_v2' for other languages
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75
                        }
                    })
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const audio = new Audio(URL.createObjectURL(blob));
                    setIsSpeaking(true);
                    audio.onended = () => setIsSpeaking(false);
                    audio.play();
                    return; // EXIT: Success with ElevenLabs
                } else {
                    console.warn("ElevenLabs Error:", await response.text());
                }
            } catch (err) {
                console.warn("ElevenLabs Failed, falling back to browser:", err);
            }
        }

        // 2. Fallback: Browser Web Speech API
        if (!('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const availableVoices = window.speechSynthesis.getVoices();

        let preferredVoice;

        if (selectedVoiceName) {
            preferredVoice = availableVoices.find(v => v.name === selectedVoiceName);
        }

        if (!preferredVoice) {
            // Priority Cascade for "Dr. Care" Female Voice
            preferredVoice =
                availableVoices.find(v => v.name === "Google US English") || // Best Chrome Voice
                availableVoices.find(v => v.name === "Samantha") || // Best Mac Voice
                availableVoices.find(v => v.name === "Microsoft Zira Desktop - English (United States)") || // Windows
                availableVoices.find(v => v.name === "Google UK English Female") ||
                availableVoices.find(v => v.name.includes("Female")) ||
                availableVoices.find(v => v.lang === "en-US"); // Fallback
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech Error:", e);
            setIsSpeaking(false);
        }

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
