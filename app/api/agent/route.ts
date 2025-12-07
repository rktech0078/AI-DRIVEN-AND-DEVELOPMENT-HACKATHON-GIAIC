
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Qdrant and Gemini (for embeddings)
// Note: We initialize these outside the handler to reuse connections if possible, 
// but in Next.js Edge/Serverless we must be careful with env vars.
// We'll init strictly needed parts inside or check envs.

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
      // Incorporate selected text into embedding query if it helps, 
      // but usually we want to find content RELEVANT to the query + selected text.
      // For now, let's embed the User Query.
      const embeddingResult = await embeddingModel.embedContent(userQuery);
      const vector = embeddingResult.embedding.values;

      // 2. Query Qdrant
      const qdrant = getQdrantClient();
      const searchResults = await qdrant.search('physical_ai_book', {
        vector: vector,
        limit: 5, // Get top 5 chunks
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
      default:
        // Default to Gemini if unknown
        client = new OpenAI({
          apiKey: process.env.GEMINI_API_KEY || 'dummy',
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        selectedModel = 'gemini-2.0-flash';
    }

    // --- Session Persistence Logic Start ---
    const cookieStore = cookies();

    // DEBUG: Check Env and Cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const urlProjectRef = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)?.[1];
    const authCookie = cookieStore.getAll().find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

    console.log("DEBUG: Env Project Ref:", urlProjectRef);
    console.log("DEBUG: Found Auth Cookie:", authCookie?.name);

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

    // Check auth using the forwarded cookies
    let { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log("DEBUG: Auth User ID (initial):", user?.id);
    if (userError) console.error("DEBUG: Initial Auth Error:", userError);

    // FALLBACK: If user missing but cookie exists, try manual token extraction
    if (!user && authCookie && authCookie.value) {
      console.log("DEBUG: Attempting manual token extraction from cookie...");
      try {
        // Cookie value format often: ["access_token","refresh_token",...] (JSON Array) or just JSON object or simple string
        let token = "";
        const decoded = decodeURIComponent(authCookie.value);

        if (decoded.trim().startsWith('[')) {
          const json = JSON.parse(decoded);
          token = json[0]; // Access token is usually first in the array from Auth Helpers
        } else if (decoded.trim().startsWith('{')) {
          const json = JSON.parse(decoded);
          token = json.access_token;
        } else {
          // Try assuming it's the token itself or parse failed
          token = decoded;
        }

        if (token) {
          console.log("DEBUG: Found candidate token, validating...");
          // Validate token by fetching user
          const { data: manualUser, error: manualError } = await supabase.auth.getUser(token);
          if (manualUser?.user) {
            user = manualUser.user;
            userError = null; // Clear error as we recovered
            console.log("DEBUG: Manual token validation SUCCESS! User ID:", user.id);
          } else {
            console.error("DEBUG: Manual token validation failed:", manualError);
          }
        } else {
          console.log("DEBUG: Could not parse token from cookie value.");
        }
      } catch (e) {
        console.error("DEBUG: Manual cookie parsing exception:", e);
      }
    }

    // Logic to determine session ID
    let currentSessionId = sessionId || (messages.length > 0 ? messages[messages.length - 1].sessionId : null) || null;
    console.log("DEBUG: Current Session ID:", currentSessionId);

    if (user) {
      try {
        // Create session if it doesn't exist AND we don't have an ID
        if (!currentSessionId) {
          console.log("DEBUG: Attempting to create new session...");
          const { data: newSession, error: sessionError } = await supabase
            .from('chat_sessions')
            .insert({
              user_id: user.id,
              title: userQuery.substring(0, 50) + '...'
            })
            .select('id')
            .single();

          if (sessionError) console.error("DEBUG: Session Create Error:", sessionError);

          if (newSession) {
            currentSessionId = newSession.id;
            console.log("DEBUG: Created New Session ID:", currentSessionId);
          }
        }

        // Save User Message
        if (currentSessionId) {
          console.log("DEBUG: Saving user message...");
          const { error: msgError } = await supabase.from('chat_messages').insert({
            session_id: currentSessionId,
            role: 'user',
            content: userQuery
          });
          if (msgError) console.error("DEBUG: User Msg Save Error:", msgError);
        }
      } catch (dbError) {
        console.error("Error saving user message to DB:", dbError);
      }
    }
    // --- Session Persistence Logic End ---

    // 5. Chat Completion
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
    });

    const reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // --- Save Assistant Response ---
    if (user && currentSessionId) {
      try {
        console.log("DEBUG: Saving assistant message...");
        const { error: replyError } = await supabase.from('chat_messages').insert({
          session_id: currentSessionId,
          role: 'assistant',
          content: reply
        });
        if (replyError) console.error("DEBUG: Assistant Msg Save Error:", replyError);
      } catch (dbError) {
        console.error("Error saving assistant message to DB:", dbError);
      }
    }

    return NextResponse.json({ reply, sessionId: currentSessionId });

  } catch (error: unknown) {
    console.error('Error in AI Agent API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
