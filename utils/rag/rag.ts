import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { HfInference } from "@huggingface/inference";
import OpenAI from "openai";
import env from "../../env.json";

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY
});

interface PhotoRow {
    id: number;
    captionVector: Array<number>;
}

interface ConversationRow {
    id: number;
    summaryVector: Array<number>;
}

interface VectorResponse {
    id: number;
    vector: Array<number>;
    similarity: number;
}

async function chat(query: string) {
    let queryEmbeddings: Array<number> = await createTextEmbedding(query);
    const db = useSQLiteContext();

    let images = await retrieveRelevantImages(db, queryEmbeddings);
    let conversations = await retrieveRelevantConversations(db, queryEmbeddings);
    let peopleIds = getRelevantPeople(db, conversations);

    let response = await generate(query, conversations, 25);
    return response;
}

function cosineSimilarity(vecA: Array<number>, vecB: Array<number>) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}
  
async function retrieveRelevantImages(db: SQLiteDatabase, queryEmbedding: Array<number>): Promise<Array<VectorResponse>> {
    const allRows: Array<PhotoRow> = await db.getAllAsync(
        `SELECT id, caption_vector FROM photos`
    );

    const sortedRows: Array<VectorResponse> = allRows
        .map(row => ({ 
            id: row.id,
            vector: row.captionVector,
            similarity: cosineSimilarity(row.captionVector, queryEmbedding) 
        }))
        .sort((a, b) => b.similarity - a.similarity);

    return sortedRows;
}

async function retrieveRelevantConversations(db: SQLiteDatabase, queryEmbedding: Array<number>): Promise<Array<VectorResponse>> {
    const allRows: Array<ConversationRow> = await db.getAllAsync(
        `SELECT id, summary_vector FROM conversations`
    );

    const sortedRows: Array<VectorResponse> = allRows
        .map(row => ({ 
            id: row.id,
            vector: row.summaryVector,
            similarity: cosineSimilarity(row.summaryVector, queryEmbedding) 
        }))
        .sort((a, b) => b.similarity - a.similarity);

    return sortedRows;
}

async function getRelevantPeople(db: SQLiteDatabase, conversations: Array<VectorResponse>): Promise<Array<number>> {
    const conversationIds = conversations.map(conv => conv.id);
    
    const peopleFrequency = await db.getAllAsync<{ personId: number, frequency: number }>(`
        SELECT person_id as personId, COUNT(*) as frequency
        FROM person_conversations
        WHERE conversation_id IN (${conversationIds.join(',')})
        GROUP BY person_id
        ORDER BY frequency DESC
    `);
    
    return peopleFrequency.map(row => row.personId);
}

async function generate(query: string, conversations: Array<VectorResponse>, context: number): Promise<string> {
    const relevantConversations = conversations.slice(0, context);
    const conversationIds = relevantConversations.map(conv => conv.id);
    const db = useSQLiteContext();
    
    const conversationData = await db.getAllAsync<{ 
        id: number;
        summary: string;
        transcriptStart: string;
        transcriptEnd: string;
        personIds: string;
    }>(`
        SELECT 
            id, 
            summary, 
            transcript_start as transcriptStart, 
            transcript_end as transcriptEnd, 
            person_ids as personIds
        FROM conversations
        WHERE id IN (${conversationIds.join(',')})
    `);
    
    const contextString = conversationData
        .map(conv => `Conversation ${conv.id}:
Time: ${new Date(conv.transcriptStart).toLocaleString()} - ${new Date(conv.transcriptEnd).toLocaleString()}
Summary: ${conv.summary}
People involved: ${conv.personIds}
---`)
        .join('\n');
    
    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that answers questions based on provided conversation histories. Use the context provided to give accurate and relevant answers."
            },
            {
                role: "user",
                content: `Context:\n${contextString}\n\nQuestion: ${query}`
            }
        ],
        temperature: 0.7,
        max_tokens: 500
    });

    return completion.choices[0].message.content || "I couldn't generate a response based on the available context.";
}

export async function createImageEmbedding(image: Blob) {
    const inference = new HfInference(env.HF_TOKEN);
    const result = await inference.imageToText({
        data: image,
        model: "Salesforce/blip-image-captioning-base",
    });

    return await createTextEmbedding(result.generated_text!);
}

export async function createTextEmbedding(text: string): Promise<Array<number>> {
    console.log("embedding: " + text)
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,  // Fixed: Using the actual text parameter instead of hardcoded string
        encoding_format: "float",
    });

    return embedding.data[0].embedding;
}