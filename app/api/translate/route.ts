
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface ProviderConfig {
    name: string;
    baseURL: string;
    apiKey: string;
    defaultModel: string;
}

const PROVIDERS: Record<string, ProviderConfig> = {
    gemini: {
        name: 'Gemini',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        apiKey: process.env.GEMINI_API_KEY || '',
        defaultModel: 'gemini-2.0-flash',
    },
    groq: {
        name: 'Groq',
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY || '',
        defaultModel: 'llama-3.3-70b-versatile',
    },
    openrouter: {
        name: 'OpenRouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        defaultModel: 'nvidia/nemotron-nano-9b-v2:free',
    }
};

async function tryTranslate(content: string, providerName: string, modelName?: string) {
    const config = PROVIDERS[providerName];
    if (!config || !config.apiKey) {
        throw new Error(`Provider ${providerName} not configured or missing API key`);
    }

    const client = new OpenAI({
        baseURL: config.baseURL,
        apiKey: config.apiKey,
    });

    const completion = await client.chat.completions.create({
        model: modelName || config.defaultModel,
        messages: [
            {
                role: "system",
                content: `You are an expert translator for technical documentation.
Translate the input text from English to Urdu.

GUIDELINES:
1. Keep the output in Markdown format.
2. Do NOT translate technical terms (e.g., ROS 2, Sim-to-Real, VLA, CUDA, Docker, Python, SLAM). Keep them in English.
3. Ensure the tone is professional yet accessible (like a university textbook).
4. Maintain the structure (headings, bullets, code blocks).
5. Do NOT wrap the entire response in a code block. Return raw Markdown.`
            },
            {
                role: "user",
                content: content
            }
        ],
    });

    return completion.choices[0].message.content;
}

export async function POST(req: NextRequest) {
    try {
        const { content, provider = 'gemini', model } = await req.json() as {
            content: string;
            provider?: string;
            model?: string;
        };

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // 1. Try User Selected Provider
        try {
            console.log(`Attempting translation with ${provider}...`);
            const translation = await tryTranslate(content, provider, model);
            return NextResponse.json({ translation, provider });
        } catch (primaryError) {
            console.error(`Primary provider ${provider} failed:`, primaryError);
        }

        // 2. Fallback Loop (Agentic Handoff)
        const fallbackOrder = ['gemini', 'groq', 'openrouter'].filter(p => p !== provider);

        for (const backupProvider of fallbackOrder) {
            try {
                console.log(`Fallback: Attempting translation with ${backupProvider}...`);
                const translation = await tryTranslate(content, backupProvider); // Use default model for fallback
                return NextResponse.json({
                    translation,
                    provider: backupProvider,
                    note: `Original provider failed. Handled by ${backupProvider}.`
                });
            } catch (backupError) {
                console.error(`Fallback provider ${backupProvider} failed:`, backupError);
                // Continue to next provider
            }
        }

        throw new Error('All translation providers failed.');

    } catch (error: unknown) {
        console.error('Translation Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Translation failed';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
