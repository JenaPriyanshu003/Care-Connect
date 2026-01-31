
import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// NOTE: For a real production app, this should be in a backend to hide the key.
const API_KEY = "AIzaSyCFHuFLFCW7K54nanr_sL0fgnQGpMQahm8";

export const useAI = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello, this is Dr. Care. I'm an AI assistant here to help you think through your symptoms — I'm not a doctor and this isn't medical advice. If this is an emergency, call 911 or your local emergency number.\n\nYou may write in any language you prefer. What's your main concern today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = useCallback(async (text) => {
        // Add user message immediately
        const userMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-flash-latest", // Explicitly available in debug list
            });

            const SYSTEM_INSTRUCTION = "You are Dr. Care, an advanced AI medical triage assistant. \n\nCLINICAL PROTOCOL:\n1. **DEMOGRAPHICS FIRST**: If the user has not provided their AGE and GENDER, you MUST ask for it immediately before giving any advice. (e.g., \"I can help with that. First, may I know your age and gender?\")\n2. **ONE QUESTION AT A TIME**: Do NOT overwhelm the user. Ask only ONE clarifying question per turn.\n3. **TRIAGE MODE**: Briefly acknowledge the symptom, then ask specifically about onset, severity, or associated symptoms.\n4. **NO LISTS**: Speak in natural, conversational paragraphs. Do not use bullet points unless summarizing a final recommendation.\n5. **VOICE OPTIMIZED**: Keep responses short (under 3 sentences) and easy to listen to.\n6. **SAFETY**: If symptoms suggest a life-threatening emergency (chest pain, stroke signs, difficulty breathing), immediately advise calling emergency services.";

            // Filter history to fit API requirements
            const historyForApi = messages
                .filter((_, index) => index > 0 || messages[0].role !== 'assistant')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.text }]
                }));

            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: "System Context: " + SYSTEM_INSTRUCTION }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I am Dr. Care. I will follow clinical triage protocols, asking for age/gender first and asking one question at a time." }]
                    },
                    ...historyForApi
                ],
                generationConfig: {
                    maxOutputTokens: 500,
                },
            });

            const result = await chat.sendMessage(text);
            const response = await result.response;
            const responseText = response.text();

            setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
        } catch (err) {
            console.error("AI Error:", err);
            setError(err.message || "Failed to get response");
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm sorry, I encountered an error. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    return { messages, sendMessage, isLoading, error };
};
