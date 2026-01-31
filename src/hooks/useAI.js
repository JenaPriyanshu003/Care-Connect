import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// NOTE: For a real production app, this should be in a backend to hide the key.
// But for this "client-side only" prototype, we'll ask user for key or use a placeholder.
const API_KEY = ""; // User will input this in the UI

export const useAI = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I am your AI Travel Doctor. How can I help you today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userApiKey, setUserApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

    const saveApiKey = (key) => {
        setUserApiKey(key);
        localStorage.setItem('gemini_api_key', key);
    };

    const sendMessage = useCallback(async (text) => {
        // Add user message immediately
        const userMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            if (!userApiKey) {
                throw new Error("Please enter your Google Gemini API Key first.");
            }

            const genAI = new GoogleGenerativeAI(userApiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const chat = model.startChat({
                history: messages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.text }]
                })),
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
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm sorry, I encountered an error. Please check your API key." }]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, userApiKey]);

    return { messages, sendMessage, isLoading, error, userApiKey, saveApiKey };
};
