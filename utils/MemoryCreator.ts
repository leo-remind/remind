import { SQLiteDatabase } from "expo-sqlite";
import OpenAI from "openai";
import env from "../env.json";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

interface Conversation {
  id: number;
  summary: string;
  summary_vector: string;
  time_created: string;
  transcript_start: string;
  transcript_end: string;
  location_id?: number;
  }

interface PersonConversation {
  person_id: number;
  conversation_id: number;
}

interface Person {
  id: number;
  name: string | null;
  relation: string | null;
}

interface Memory {
  id?: number;
  type: string;
  date: Date;
  name: string;
  summary: string;
  memory_start: string;
  memory_end: string;
  trip_id?: number;
}

export class MemoryCreator {
  private lastProcessedTimestamp: string;

  constructor() {
    this.lastProcessedTimestamp = new Date(Date.now() - 60000).toISOString(); // Start from 1 hour ago
  }

  private async getUnprocessedConversations(db: SQLiteDatabase): Promise<{
    conversations: Conversation[];
    personConversations: PersonConversation[];
    persons: Person[];
  }> {
    console.log("CHAITANYA CODE");

    const converstaions_content = await db.getAllAsync<Conversation>(
      `SELECT * FROM conversations`
    );

    console.log(converstaions_content);

    let arr = this.lastProcessedTimestamp.split("T");
    let date = arr[0];
    let time = arr[1].split(".")[0];
    let final_time = date + " " + time;
    console.log("final_time", final_time);

    const conversations = await db.getAllAsync<Conversation>(
      `SELECT c.* FROM conversations c
       WHERE c.time_created > ? 
       ORDER BY c.time_created ASC`,
      [final_time]
    );

    console.log(final_time);

    if (conversations.length === 0) {
      return { conversations: [], personConversations: [], persons: [] };
    }

    const conversationIds = conversations.map((conv) => conv.id);

    const personConversations = await db.getAllAsync<PersonConversation>(
      `SELECT * FROM person_conversations 
       WHERE conversation_id IN (${conversationIds.join(",")})`
    );

    const personIds = [
      ...new Set(personConversations.map((pc) => pc.person_id)),
    ];
    const persons = await db.getAllAsync<Person>(
      `SELECT id, name, relation FROM persons 
       WHERE id IN (${personIds.join(",")})`
    );

    return { conversations, personConversations, persons };
  }

  private async generateMemoryWithAI(
    conversations: Conversation[],
    persons: Person[]
  ): Promise<Memory[]> { 
    const personsInfo = persons
      .map(
        (p) => `${p.name || "Unknown"}${p.relation ? ` (${p.relation})` : ""}`
      )
      .join(", ");
  
    const prompt = `You are given a series of conversations that took place within a one-hour timeframe. Your task is to extract the key events or discussions that hold significant meaning. Generate at most 6 memories from these conversations, with each memory having a meaningful name that encapsulates its essence.
  
  Participants: ${personsInfo}
  Time Range: Past 1 hour
  
  Conversations:
  ${conversations.map((conv) => `- ${conv.summary}`).join("\n")}
  
  Generate memories in JSON format with the following structure:
  {
    "memories": [
      {
        "name": "A concise, meaningful title that captures the essence of this memory",
        "summary": "A detailed description focusing on the significance of this interaction or event",
        "date": "2024-02-09T15:30:00Z"
      }
    ]
  }`;
  
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
    });
  
    if (!completion.choices[0].message.content) {
      throw new Error("Completion content is null");
    }
    const response = JSON.parse(completion.choices[0].message.content);
  
    console.log(completion.choices[0].message.content);
  
    if (!response.memories || !Array.isArray(response.memories)) {
      throw new Error("Invalid response format: memories array not found");
    }
  
    // Process all memories in the array
    return response.memories.map((memory: any) => ({
      name: memory.name,
      summary: memory.summary,
      date: new Date(memory.date),
      memory_start: conversations[0].time_created,
      memory_end: conversations[conversations.length - 1].time_created,
    }));
  }
  
  private async saveMemories(
    db: SQLiteDatabase,
    memories: Memory[],
    conversationIds: number[]
  ): Promise<void> {
    await db.runAsync(`BEGIN TRANSACTION;`);
  
    try {
      for (const memory of memories) {
        const result = await db.runAsync(
          `INSERT INTO memory (date, name, summary, memory_start, memory_end, trip_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            memory.date.toISOString(),
            memory.name,
            memory.summary,
            memory.memory_start,
            memory.memory_end,
            memory.trip_id || null,
          ]
        );
  
        const memoryId = result.lastInsertRowId;
  
        // Link each memory to all conversations in the group
        for (const conversationId of conversationIds) {
          await db.runAsync(
            `INSERT INTO memory_conversations (memory_id, conversation_id)
             VALUES (?, ?)`,
            [memoryId, conversationId]
          );
        }
      }
  
      await db.runAsync(`COMMIT;`);
    } catch (error) {
      await db.runAsync(`ROLLBACK;`);
      throw error;
    }
  }
  
  public async createMemories(db: SQLiteDatabase): Promise<void> {
    try {
      const { conversations, personConversations, persons } =
        await this.getUnprocessedConversations(db);
  
      if (conversations.length === 0) {
        console.log("No new conversations to process");
        return;
      }
  
      // Group conversations by participating persons
      const conversationGroups = new Map<
        string,
        {
          conversations: Conversation[];
          persons: Person[];
        }
      >();
  
      for (const conversation of conversations) {
        const participantIds = personConversations
          .filter((pc) => pc.conversation_id === conversation.id)
          .map((pc) => pc.person_id)
          .sort()
          .join("-");
  
        if (!conversationGroups.has(participantIds)) {
          const groupPersons = persons.filter((p) =>
            participantIds.split("-").includes(p.id.toString())
          );
  
          conversationGroups.set(participantIds, {
            conversations: [],
            persons: groupPersons,
          });
        }
  
        conversationGroups
          .get(participantIds)
          ?.conversations.push(conversation);
      }
  
      for (const [_, group] of conversationGroups) {
        const memories = await this.generateMemoryWithAI(
          group.conversations,
          group.persons
        );
  
        await this.saveMemories(  // Changed to saveMemories
          db,
          memories,
          group.conversations.map((conv) => conv.id)
        );
      }
  
      if (conversations.length > 0) {
        this.lastProcessedTimestamp =
          conversations[conversations.length - 1].time_created;
      }
    } catch (error) {
      console.error("Error creating memories:", error);
      throw error;
    }
  }
}