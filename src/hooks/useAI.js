
import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// NOTE: For a real production app, this should be in a backend to hide the key.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

            const SYSTEM_INSTRUCTION = "You are Dr. Care, an AI health assistant designed to help users think through their symptoms. \n\nCRITICAL IDENTITY RULES:\n1. You are NOT a doctor. You are an AI assistant.\n2. Do NOT give definitive medical advice. Always suggest consulting a professional.\n3. If the user mentions an emergency (chest pain, severe bleeding, difficulty breathing), immediately tell them to call 911.\n4. You can write in any language the user prefers.\n5. Be concise, empathetic, and professional.\n6. Your goal is to gather information to help them understand their situation, potentially generating a summary (SBAR) later if needed.\n7. VOICE MODE: Keep responses relatively short (2-3 sentences max) unless explaining a complex list.";

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
                        parts: [{ text: "Understood. I am Dr. Care. I will help users think through symptoms without giving medical advice." }]
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
