import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { HfInference } from "@huggingface/inference";
import OpenAI from "openai";
import env from "../../env.json";

interface PhotoRow {
    id: number;
    caption_vector: Blob;
}

interface ConversationRow {
    id: number;
    summary_vector: string;
}

interface FaceRow {
    id: number;
    face_embedding: Blob;
}

interface VectorResponse {
    id: number;
    vector: Float32Array;
    similarity: number;
}

const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY
    });

export async function chat(db : SQLiteDatabase,query: string)  : Promise<Object>{
    let queryEmbeddings: Float32Array = await createTextEmbedding(query);

    //let images = await retrieveRelevantImages(db, queryEmbeddings);
    console.log("yaya")
    let conversations = await retrieveRelevantConversations(db, queryEmbeddings);
    //let peopleIds = getRelevantPeople(db, conversations);

    let response = await generate(db,query, conversations, 15);
    return {
        answer: response,
        photos: [],
        people: []
    };
}

function cosineSimilarity(vecA: Float32Array, vecB: Float32Array) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}
  
async function retrieveRelevantImages(db: SQLiteDatabase, queryEmbedding: Float32Array): Promise<Array<VectorResponse>> {
    const allRows: Array<PhotoRow> = await db.getAllAsync(
        `SELECT id, caption_vector FROM photos`
    );

    const sortedRows: Array<VectorResponse> = await Promise.all(
        allRows.map(async row => ({ 
            id: row.id,
            vector: new Float32Array(await row.caption_vector.arrayBuffer()),
            similarity: cosineSimilarity(
                new Float32Array(await row.caption_vector.arrayBuffer()),
                queryEmbedding
            ) 
        }))
    );

    return sortedRows.sort((a, b) => b.similarity - a.similarity).filter((num) => num.similarity);
}

async function retrieveRelevantConversations(db: SQLiteDatabase, queryEmbedding: Float32Array): Promise<Array<VectorResponse>> {
    const allRows: Array<ConversationRow> = await db.getAllAsync(
        `SELECT id, summary_vector FROM conversations`
    );

    const sortedRows: Array<VectorResponse> = await Promise.all(
        allRows.map(async row => ({ 
            id: row.id,
            vector: new Float32Array(eval(row.summary_vector)),
            similarity: cosineSimilarity(
                new Float32Array(eval(row.summary_vector)),
                queryEmbedding
            ) 
        }))
    );
    return sortedRows.sort((a, b) => b.similarity - a.similarity).filter((num) => num.similarity );
}

export async function getHighestMatchingFace(db: SQLiteDatabase, targetFaceEmbedding: Float32Array, threshold: number): Promise<number|null> {
    const allRows: Array<FaceRow> = await db.getAllAsync(
        `SELECT id, face_embedding FROM persons`
    );

    const sortedRows: Array<VectorResponse> = await Promise.all(
        allRows.map(async row => ({ 
            id: row.id,
            vector: new Float32Array(await row.face_embedding.arrayBuffer()),
            similarity: cosineSimilarity(
                new Float32Array(await row.face_embedding.arrayBuffer()),
                targetFaceEmbedding
            ) 
        }))
    );
    
    const filteredRows = sortedRows
        .sort((a, b) => b.similarity - a.similarity)
        .filter(item => item.similarity >= threshold);
    
    return filteredRows.length > 0 ? filteredRows[0].id : null;
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

async function generate(db:SQLiteDatabase, query: string, conversations: Array<VectorResponse>, context: number): Promise<string> {
    console.log("trying")
    const relevantConversations = conversations.slice(0, context);
    const conversationIds = relevantConversations.map(conv => conv.id);
    
    const conversationData = await db.getAllAsync<{ 
        id: number;
        summary: string;
        transcriptStart: string;
        transcriptEnd: string;
    }>(`
        SELECT 
            id, 
            summary, 
            transcript_start as transcriptStart, 
            transcript_end as transcriptEnd 
        FROM conversations
        WHERE id IN (${conversationIds.join(',')})
    `);
    
    const contextString = conversationData
        .map(conv => `${conv.summary}\n`)
        .join('\n');
    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that answers questions based on provided conversation histories. Use the context provided to give accurate and relevant answers. Ensure that your replies are concise and in one paragraph"
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

export async function createImageEmbedding(image: Blob): Promise<Float32Array> {
    const inference = new HfInference(env.HF_TOKEN);
    const result = await inference.imageToText({
        data: image,
        model: "Salesforce/blip-image-captioning-base",
    });

    return await createTextEmbedding(result.generated_text!);
}

export async function createTextEmbedding(text: string): Promise<Float32Array> {
    console.log("embedding: " + text);
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    console.log("done")

    return new Float32Array(embedding.data[0].embedding);
}