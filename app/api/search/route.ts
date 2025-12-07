import { NextResponse } from 'next/server';
import { qdrantClient, COLLECTION_NAME } from '@/lib/qdrant';
import { generateEmbedding } from '@/lib/gemini';
import { aiService } from '@/lib/ai-service';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // 1. Generate Embedding
        const queryEmbedding = await generateEmbedding(query);

        // 2. Search Qdrant
        const searchResults = await qdrantClient.search(COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: 5,
            with_payload: true,
        });

        // 3. Format Results
        const results = searchResults.map(hit => ({
            id: hit.id,
            score: hit.score,
            pageContent: hit.payload?.content,
            metadata: hit.payload?.metadata
        }));

        // 4. Generate AI Answer (RAG)
        let answer = null;
        if (results.length > 0) {
            const context = results.map(r => r.pageContent).join("\n\n");
            answer = await aiService.generateAnswer(query, context);
        }

        return NextResponse.json({ results, answer });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
