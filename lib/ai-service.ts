import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export class AIService {

    // Primary: Gemini
    private async tryGemini(prompt: string) {
        if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Failed:", error);
            throw error;
        }
    }

    // Fallback 1: Groq (Llama 3)
    private async tryGroq(prompt: string) {
        if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama3-8b-8192"
                })
            });
            if (!res.ok) throw new Error(`Groq status: ${res.status}`);
            const data = await res.json();
            return data.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("Groq Failed:", error);
            throw error;
        }
    }

    // Fallback 2: OpenRouter (Auto Route)
    private async tryOpenRouter(prompt: string) {
        if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing");
        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [{ role: "user", content: prompt }],
                    model: "openai/gpt-3.5-turbo" // Or any free/cheap model
                })
            });
            if (!res.ok) throw new Error(`OpenRouter status: ${res.status}`);
            const data = await res.json();
            return data.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("OpenRouter Failed:", error);
            throw error;
        }
    }

    // Fallback 3: Mistral AI
    private async tryMistral(prompt: string) {
        if (!MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY missing");
        try {
            const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [{ role: "user", content: prompt }],
                    model: "mistral-small-latest"
                })
            });
            if (!res.ok) throw new Error(`Mistral status: ${res.status}`);
            const data = await res.json();
            return data.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("Mistral Failed:", error);
            throw error;
        }
    }

    // Main Function
    async generateAnswer(query: string, context: string) {
        const prompt = `
        You are an intelligent documentation assistant for the "Physical AI & Humanoid Robotics" book.
        Answer the user's question based ONLY on the provided context.
        If the answer is not in the context, say "I couldn't find the answer in the documentation."
        
        Question: ${query}
        
        Context:
        ${context}
        `;

        // 1. Try Gemini
        try {
            return { provider: "Gemini", content: await this.tryGemini(prompt) };
        } catch {
            console.warn("Switching to Groq...");
        }

        // 2. Try Groq
        try {
            return { provider: "Groq", content: await this.tryGroq(prompt) };
        } catch {
            console.warn("Switching to OpenRouter...");
        }

        // 3. Try OpenRouter
        try {
            return { provider: "OpenRouter", content: await this.tryOpenRouter(prompt) };
        } catch {
            console.warn("Switching to Mistral...");
        }

        // 4. Try Mistral
        try {
            return { provider: "Mistral", content: await this.tryMistral(prompt) };
        } catch {
            console.error("All AI Providers failed.");
            return { provider: "None", content: "Sorry, I am currently overloaded. Please try again later." };
        }
    }
}

export const aiService = new AIService();
