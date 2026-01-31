import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// NOTE: For a real production app, this should be in a backend to hide the key.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBX0zOG_JGmS7nsmbLqBk4LqYbNaqsWiDo";

export const useAI = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I am your AI Travel Doctor. How can I help you today?" }
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
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            // Gemini requires history to start with 'user'. 
            // We filter out the initial assistant greeting or any leading model messages.
            const historyForApi = messages
                .filter((_, index) => index > 0 || messages[0].role !== 'assistant')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.text }]
                }));

            const chat = model.startChat({
                history: historyForApi,
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
