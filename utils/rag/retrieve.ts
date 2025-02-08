import { useSQLiteContext,
        type SQLiteDatabase } from 'expo-sqlite';
import { HfInference } from "@huggingface/inference";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

interface PhotoRow {
    id : number,
    caption_vector : Array<number>
}

interface ConversationRow {
    id : number,
    summary_vector : Array<number>
}

interface VectorResponse {
    id: number,
    vector: Array<number>
    similarity: number
}

async function chat(query: string) {
    let query_embeddings : Array<number> = await create_text_embeddings(query);
    const db = useSQLiteContext();

    let images = await retrieve_relevant_images(db, query_embeddings);
    let conversations = await retrieve_relevant_conversations(db, query_embeddings);
    let people_ids = get_relevant_people(db, conversations);

    let response = await generate(query, conversations, 25);
}

function cosine_similarity(vecA : Array<number>, vecB: Array<number>) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }
  
async function retrieve_relevant_images(db: SQLiteDatabase,  query_embedding : Array<number>) : Promise<Array<VectorResponse>>{
    const allRows : Array<PhotoRow> = await db.getAllAsync(
        `SELECT id, caption_vector FROM photos`
    );

    const sortedRows : Array<VectorResponse> = allRows
        .map(row => ({ 
        id: row.id,
        vector: row.caption_vector,
        similarity: cosine_similarity(row.caption_vector, query_embedding) 
        }))
        .sort((a, b) => b.similarity - a.similarity);

    return sortedRows;
}

async function retrieve_relevant_conversations(db: SQLiteDatabase,query_embedding: Array<number>) : Promise<Array<VectorResponse>> {
    const allRows : Array<ConversationRow> = await db.getAllAsync(
        `SELECT id, summary_vector FROM conversations`
    );

    const sortedRows : Array<VectorResponse> = allRows
        .map(row => ({ 
        id: row.id,
        vector: row.summary_vector,
        similarity: cosine_similarity(row.summary_vector, query_embedding) 
        }))
        .sort((a, b) => b.similarity - a.similarity);

    return sortedRows;
}

async function get_relevant_people(db: SQLiteDatabase, conversations: Array<VectorResponse>): Promise<Array<number>> {
    // Get conversation IDs ordered by relevance
    const conversationIds = conversations.map(conv => conv.id);
    
    // Query to get all unique people involved in these conversations with their frequency
    const peopleFrequency = await db.getAllAsync<{ person_id: number, frequency: number }>(`
        SELECT person_id, COUNT(*) as frequency
        FROM person_conversations
        WHERE conversation_id IN (${conversationIds.join(',')})
        GROUP BY person_id
        ORDER BY frequency DESC
    `);
    
    // Return array of person_ids ordered by frequency
    return peopleFrequency.map(row => row.person_id);
}

async function generate(query: string, conversations: Array<VectorResponse>, context: number): Promise<string> {
    // Get the most relevant conversations based on context limit
    const relevantConversations = conversations.slice(0, context);
    
    // Query to get the full conversation data
    const conversationIds = relevantConversations.map(conv => conv.id);
    const db = useSQLiteContext();
    
    const conversationData = await db.getAllAsync<{ 
        id: number, 
        summary: string, 
        transcript_start: string,
        transcript_end: string,
        person_ids: string 
    }>(`
        SELECT id, summary, transcript_start, transcript_end, person_ids
        FROM conversations
        WHERE id IN (${conversationIds.join(',')})
    `);
    
    // Create the prompt with context
    const contextString = conversationData
        .map(conv => `Conversation ${conv.id}:
Time: ${new Date(conv.transcript_start).toLocaleString()} - ${new Date(conv.transcript_end).toLocaleString()}
Summary: ${conv.summary}
People involved: ${conv.person_ids}
---`)
        .join('\n');
    
    // Generate response using OpenAI
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

async function create_photo_embeddings(image: Blob) {
    const inference = new HfInference(process.env.HF_TOKEN);
    const result = await inference.imageToText({
        data: image,
        model: "Salesforce/blip-image-captioning-base",
    });

    console.log(result.generated_text);
    return await create_text_embeddings(result.generated_text!)
}

async function create_text_embeddings(text: string) : Promise<Array<number>> {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: "Your text string goes here",
        encoding_format: "float",
      });

    return embedding.data[0].embedding;
}