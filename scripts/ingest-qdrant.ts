
import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!QDRANT_URL || !QDRANT_API_KEY || !GEMINI_API_KEY) {
    console.error('Missing environment variables. Please check .env.local');
    process.exit(1);
}

const COLLECTION_NAME = 'physical_ai_book';

// Initialize Clients
const qdrant = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function getEmbedding(text: string) {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}

// Function to recursively get all MDX files
function getMdxFiles(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getMdxFiles(filePath, fileList);
        } else {
            if (file.endsWith('.mdx') || file.endsWith('.md')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

function extractMetadataFromPath(filePath: string) {
    // Expected path: .../app/docs/section-X/chapter-Y/page.mdx
    const parts = filePath.split(path.sep);
    const sectionPart = parts.find(p => p.startsWith('section-'));
    const chapterPart = parts.find(p => p.startsWith('chapter-'));

    // Formatting: "section-1" -> "Section 1"
    const section = sectionPart ? sectionPart.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General';
    const chapter = chapterPart ? chapterPart.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General';

    return { section, chapter };
}

// Chunking strategy: Split by headers but respect file boundaries
function chunkFileContent(content: string, metadata: { section: string, chapter: string }) {
    const lines = content.split('\n');
    const chunks: { id: string; content: string; metadata: any }[] = [];
    let currentChunk = '';

    // Simple improvement: include file metadata directly in the content string for better context
    // or just rely on the payload metadata.
    // Let's prepend metadata context to the chunk content for better semantic embedding
    const contextPrefix = `Section: ${metadata.section}, Chapter: ${metadata.chapter}\n`;

    for (const line of lines) {
        if (line.startsWith('#')) {
            // New Heading - likely a good split point
            if (currentChunk.trim()) {
                chunks.push({
                    id: uuidv4(),
                    content: contextPrefix + currentChunk.trim(),
                    metadata: metadata
                });
                currentChunk = '';
            }
            currentChunk += line + '\n';
        } else {
            currentChunk += line + '\n';
        }

        // Split large chunks
        if (currentChunk.length > 1500) {
            chunks.push({
                id: uuidv4(),
                content: contextPrefix + currentChunk.trim(),
                metadata: metadata
            });
            currentChunk = '';
        }
    }

    if (currentChunk.trim()) {
        chunks.push({
            id: uuidv4(),
            content: contextPrefix + currentChunk.trim(),
            metadata: metadata
        });
    }

    return chunks;
}

async function main() {
    console.log('📖 Scanning `app/docs` for content...');
    const docsDir = path.join(process.cwd(), 'app', 'docs');
    const mdxFiles = getMdxFiles(docsDir);
    console.log(`Found ${mdxFiles.length} documentation files.`);

    const allChunks = [];

    console.log('🔪 Reading and Chunking files...');
    for (const file of mdxFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const metadata = extractMetadataFromPath(file);
        const chunks = chunkFileContent(content, metadata);
        allChunks.push(...chunks);
    }

    console.log(`📦 Generated ${allChunks.length} total chunks.`);

    console.log('🗄️ Checking Collection...');
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
        console.log(`✨ Creating collection: ${COLLECTION_NAME}`);
        await qdrant.createCollection(COLLECTION_NAME, {
            vectors: {
                size: 768, // Gemini text-embedding-004 dimension
                distance: 'Cosine',
            },
        });
    } else {
        console.log(`ℹ️ Collection ${COLLECTION_NAME} already exists. (Appending/Upserting)`);
    }

    console.log('🚀 Generating Embeddings & Uploading...');

    // Process in batches
    const BATCH_SIZE = 5;
    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
        const batch = allChunks.slice(i, i + BATCH_SIZE);
        const points = [];

        for (const chunk of batch) {
            try {
                // Remove Markdown metadata from content if present (optional)
                // but usually fine to keep
                const vector = await getEmbedding(chunk.content);
                points.push({
                    id: chunk.id,
                    vector: vector,
                    payload: {
                        content: chunk.content,
                        ...chunk.metadata
                    }
                });
            } catch (e) {
                console.error(`Error embedding chunk: ${e}`);
            }
        }

        if (points.length > 0) {
            await qdrant.upsert(COLLECTION_NAME, {
                points: points
            });
            // Simple visual progress
            const progress = Math.round(((i + BATCH_SIZE) / allChunks.length) * 100);
            process.stdout.write(`\r✅ Progress: ${Math.min(progress, 100)}%`);
        }
    }

    console.log('\n🎉 Ingestion Complete!');
}

main().catch(console.error);
