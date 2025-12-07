
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Qdrant and Gemini (for embeddings)
const getEmbdeddingModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "text-embedding-004" });
};

const getQdrantClient = () => {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;
  if (!url || !apiKey) throw new Error("Qdrant credentials missing");
  return new QdrantClient({ url, apiKey });
};

const SYSTEM_PROMPT_TEMPLATE = `
You are a specialized AI Assistant for the "Physical AI & Humanoid Robotics" book.
You are an intelligent RAG (Retrieval-Augmented Generation) agent.

GUARDRAILS:
1. You must ONLY answer questions related to the book content provided below or in the context.
2. If a user asks about a topic not covered in the book (e.g., general knowledge, politics), politely refuse.
3. Use the provided "Book Context" to answer the question.
4. If a "User Selected Text" is provided, focus your answer on explaining or analyzing that specific text.
5. Be helpful, concise, and professional.
6. Speak in the language the user asks (English or Roman Urdu).
7. ALWAYS format your response using Markdown. Use bolding for key terms, bullet points for lists, and headings for sections.

## Formatting Rules:
- Use **Bold** for important concepts.
- Use \`Code Blocks\` for commands or code.
- Use > Blockquotes for definitions.
- Use ### Headings to structure long answers.

IMPORTANT: Do NOT wrap the entire response in a code block (like \`\`\`markdown ... \`\`\`). Return raw markdown text directly so it can be rendered correctly.

---
BOOK CONTEXT:
{CONTEXT}
---
`;

export async function POST(req: NextRequest) {
  try {
    const { messages, provider, model, selectedText, sessionId } = await req.json() as {
      messages: { role: string; content: string; sessionId?: string }[];
      provider: string;
      model: string;
      selectedText?: string;
      sessionId?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // 1. Generate Embedding for the Query
    let contextString = "";
    try {
      const embeddingModel = getEmbdeddingModel();
      const embeddingResult = await embeddingModel.embedContent(userQuery);
      const vector = embeddingResult.embedding.values;

      // 2. Query Qdrant
      const qdrant = getQdrantClient();
      const searchResults = await qdrant.search('physical_ai_book', {
        vector: vector,
        limit: 5,
        with_payload: true
      });

      const contextChunks = searchResults.map(res => res.payload?.content).filter(Boolean);
      contextString = contextChunks.join("\n\n---\n\n");

    } catch (err) {
      console.error("RAG Retrieval Error:", err);
      contextString = "Error retrieving context from database. Please rely on your general knowledge if related to robotics.";
    }

    // 3. Construct System Prompt
    let finalSystemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{CONTEXT}', contextString);

    if (selectedText) {
      finalSystemPrompt += `\n\nUSER SELECTED TEXT:\n"${selectedText}"\n\nPlease prioritize this selected text in your explanation.\n`;
    }

    // 4. Client Selection
    let client: OpenAI;
    let selectedModel = model;

    console.log(`Provider: ${provider}, Model: ${model}`);

    switch (provider) {
      case 'gemini':
        client = new OpenAI({
          apiKey: process.env.GEMINI_API_KEY || 'dummy',
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        selectedModel = model || 'gemini-2.0-flash';
        break;
      case 'openrouter':
        client = new OpenAI({
          apiKey: process.env.OPENROUTER_API_KEY || 'dummy',
          baseURL: 'https://openrouter.ai/api/v1',
        });
        selectedModel = model || 'meta-llama/llama-4-scout-17b-16e-instruct';
        break;
      case 'groq':
        client = new OpenAI({
          apiKey: process.env.GROQ_API_KEY || 'dummy',
          baseURL: 'https://api.groq.com/openai/v1',
        });
        selectedModel = model || 'llama-3.2-11b-vision-preview';
        break;
      case 'mistral':
        client = new OpenAI({
          apiKey: process.env.MISTRAL_API_KEY || 'dummy',
          baseURL: 'https://api.mistral.ai/v1',
        });
        selectedModel = model || 'mistral-small-latest';
        break;
      default:
        client = new OpenAI({
          apiKey: process.env.GEMINI_API_KEY || 'dummy',
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        selectedModel = 'gemini-2.0-flash';
    }

    // --- Session Persistence Logic (Pre-computation) ---
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    );

    // Get DB User
    let { data: { user } } = await supabase.auth.getUser();

    // Fallback: Check for auth cookie manually if getUser fails
    const authCookie = cookieStore.getAll().find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
    if (!user && authCookie && authCookie.value) {
      try {
        const decoded = decodeURIComponent(authCookie.value);
        let token = "";
        if (decoded.trim().startsWith('[')) token = JSON.parse(decoded)[0];
        else if (decoded.trim().startsWith('{')) token = JSON.parse(decoded).access_token;
        else token = decoded;

        if (token) {
          const { data: manualUser } = await supabase.auth.getUser(token);
          if (manualUser?.user) user = manualUser.user;
        }
      } catch (e) {
        console.error("Manual token parse failed", e);
      }
    }

    // Determine/Create Session ID
    let currentSessionId = sessionId || (messages.length > 0 ? messages.find(m => m.sessionId)?.sessionId : null) || null;

    if (user) {
      if (!currentSessionId) {
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ user_id: user.id, title: userQuery.substring(0, 50) + '...' })
          .select('id')
          .single();
        if (newSession) currentSessionId = newSession.id;
      }

      if (currentSessionId) {
        // Save User message
        await supabase.from('chat_messages').insert({
          session_id: currentSessionId,
          role: 'user',
          content: userQuery
        });
      }
    }

    // 5. Chat Completion with STREAMING
    const response = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: finalSystemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content
        }))
      ],
      temperature: 0.3,
      stream: true, // ENABLE STREAMING
    });

    // Create a TransformStream to pass through data AND accumulate it
    const encoder = new TextEncoder();

    let accumulatedReply = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send the Session ID as the first chunk (special format)
          // We'll use a delimiter like "||SESSION_ID:..." or just a custom header/prefix if possible.
          // EASIER: Send it as a JSON chunk if the client expects it, OR just rely on the client knowing the session ID if it sent it.
          // If it's a NEW session, the client needs to know.
          // Standard Approach: Return SessionID in a header? Headers are already sent.
          // We'll prepend it to the stream with a unique separator if strictly needed, 
          // BUT for now, let's assume the client handles the "new session" case by re-fetching or we just accept 
          // that the first message might not update the URL bar immediately until a reload/navigation.
          // BETTER: Send valid JSON chunks? No, that breaks simple text streaming.
          // Let's stick to text streaming. We'll send the session ID in a custom header `X-Session-Id`.

          // Note: Headers are read-only on NextResponse usually, but we can set them on init.

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              accumulatedReply += content;
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error("Streaming Error", err);
          controller.error(err);
        } finally {
          controller.close();

          // SAVE TO DB AFTER STREAM CLOSES
          if (user && currentSessionId && accumulatedReply) {
            try {
              console.log("Saving accumulated response to DB...");
              await supabase.from('chat_messages').insert({
                session_id: currentSessionId,
                role: 'assistant',
                content: accumulatedReply
              });
            } catch (e) {
              console.error("Failed to save completion to DB", e);
            }
          }
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': currentSessionId || '',
      }
    });

  } catch (error: unknown) {
    console.error('Error in AI Agent API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
