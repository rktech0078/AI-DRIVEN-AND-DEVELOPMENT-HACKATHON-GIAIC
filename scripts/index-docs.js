const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { QdrantClient } = require("@qdrant/js-client-rest");
require('dotenv').config({ path: '.env.local' });

// Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "docs_chunks";
const DOCS_DIR = path.join(process.cwd(), "app", "docs");

async function generateEmbedding(text) {
    const result = await model.embedContent(text);
    return result.embedding.values;
}

// Simple recursive file walker
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith(".mdx")) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

// Content Chunker
function chunkContent(content, filename) {
    // Split by headers or newlines mostly
    // For simplicity: Split by double newline (paragraphs) and keep reasonable size
    const rawChunks = content.split(/\n\s*\n/);
    const chunks = [];

    // Extract Title (simple heuristic: first # header)
    const titleMatch = content.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filename, '.mdx');

    let currentChunk = "";

    for (const chunk of rawChunks) {
        if ((currentChunk.length + chunk.length) < 1000) {
            currentChunk += "\n\n" + chunk;
        } else {
            if (currentChunk.trim()) {
                chunks.push({
                    content: currentChunk.trim(),
                    title: title
                });
            }
            currentChunk = chunk;
        }
    }
    if (currentChunk.trim()) {
        chunks.push({
            content: currentChunk.trim(),
            title: title
        });
    }

    return chunks;
}

async function main() {
    console.log("🚀 Starting Indexing...");

    // 1. Recreate Collection
    try {
        await qdrantClient.deleteCollection(COLLECTION_NAME);
        console.log(`🗑️ Deleted existing collection: ${COLLECTION_NAME}`);
    } catch (e) {
        // Ignore if doesn't exist
    }

    await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
            size: 768, // text-embedding-004 size
            distance: "Cosine",
        },
    });
    console.log(`✅ Created collection: ${COLLECTION_NAME}`);

    // 2. Read Files
    const files = getAllFiles(DOCS_DIR);
    console.log(`📂 Found ${files.length} MDX files.`);

    const points = [];
    let idCounter = 1;

    // 3. Process Files
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = file.replace(process.cwd(), '').replace(/\\/g, '/').replace('/app', ''); // Fix path for router.push

        const chunks = chunkContent(content, file);

        console.log(`📄 Processing ${path.basename(file)}: ${chunks.length} chunks`);

        for (const chunk of chunks) {
            try {
                const embedding = await generateEmbedding(chunk.content);

                points.push({
                    id: idCounter++,
                    vector: embedding,
                    payload: {
                        content: chunk.content,
                        metadata: {
                            title: chunk.title,
                            path: relativePath,
                            source: path.basename(file)
                        }
                    }
                });
                // Batch upload every 20 points
                if (points.length >= 20) {
                    await qdrantClient.upsert(COLLECTION_NAME, { points: points });
                    console.log(`📤 Uploaded ${points.length} points.`);
                    points.length = 0; // Clear array
                }

            } catch (err) {
                console.error(`❌ Error embedding chunk in ${file}:`, err);
            }
        }
    }

    // Upload remaining
    if (points.length > 0) {
        await qdrantClient.upsert(COLLECTION_NAME, { points: points });
        console.log(`📤 Uploaded final ${points.length} points.`);
    }

    console.log("🎉 Indexing Complete!");
}

main().catch(console.error);
