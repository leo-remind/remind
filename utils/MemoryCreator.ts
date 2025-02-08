import { SQLiteDatabase } from 'expo-sqlite';
import OpenAI from 'openai';
import env from '../env.json';

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
  dates: string;
  name: string;
  summary: string;
  memory_start: string;
  memory_end: string;
  trip_id?: number;
}

export class MemoryCreator {
  private lastProcessedTimestamp: string;

  constructor() {
    this.lastProcessedTimestamp = new Date(Date.now() - 3600000).toISOString(); // Start from 1 hour ago
  }

  private async getUnprocessedConversations(db: SQLiteDatabase): Promise<{
    conversations: Conversation[];
    personConversations: PersonConversation[];
    persons: Person[];
  }> {
    const conversations = await db.getAllAsync<Conversation>(
      `SELECT c.* FROM conversations c
       LEFT JOIN memory_conversations mc ON c.id = mc.conversation_id
       WHERE c.time_created > ?
       AND mc.memory_id IS NULL
       ORDER BY c.time_created ASC`,
      [this.lastProcessedTimestamp]
    );

    if (conversations.length === 0) {
      return { conversations: [], personConversations: [], persons: [] };
    }

    const conversationIds = conversations.map(conv => conv.id);

    const personConversations = await db.getAllAsync<PersonConversation>(
      `SELECT * FROM person_conversations 
       WHERE conversation_id IN (${conversationIds.join(',')})`,
    );

    const personIds = [...new Set(personConversations.map(pc => pc.person_id))];
    const persons = await db.getAllAsync<Person>(
      `SELECT id, name, relation FROM persons 
       WHERE id IN (${personIds.join(',')})`,
    );

    return { conversations, personConversations, persons };
  }

  private async generateMemoryWithAI(
    conversations: Conversation[],
    persons: Person[]
  ): Promise<Memory> {
    const personsInfo = persons.map(p => `${p.name || 'Unknown'}${p.relation ? ` (${p.relation})` : ''}`).join(', ');
    const timeRange = {
      start: new Date(Math.min(...conversations.map(c => new Date(c.transcript_start).getTime()))),
      end: new Date(Math.max(...conversations.map(c => new Date(c.transcript_end).getTime())))
    };

    const prompt = `You are given a series of conversations that took place within a one-hour timeframe. Your task is to extract the key events or discussions that hold significant meaning. Generate at most 6 memories from these conversations, with each memory having a meaningful name that encapsulates its essence.

Participants: ${personsInfo}
Time Range: ${timeRange.start.toISOString()} to ${timeRange.end.toISOString()}

Conversations:
${conversations.map(conv => `- ${conv.summary}`).join('\n')}

Generate memories in JSON format with the following structure:
{
  "memories": [
    {
      "type": "one of: conversation, activity, event, milestone",
      "name": "A concise, meaningful title that captures the essence of this memory",
      "summary": "A detailed description focusing on the significance of this interaction or event",
      "dates": "A natural language description of when this occurred"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0].message.content) {
      throw new Error('Completion content is null');
    }
    const response = JSON.parse(completion.choices[0].message.content);
    
    return {
      type: response.type,
      name: response.name,
      summary: response.summary,
      dates: response.dates,
      memory_start: timeRange.start.toISOString(),
      memory_end: timeRange.end.toISOString()
    };
  }

  private async saveMemory(
    db: SQLiteDatabase,
    memory: Memory, 
    conversationIds: number[]
  ): Promise<void> {
    await db.runAsync(
      `BEGIN TRANSACTION;`
    );

    try {
      const result = await db.runAsync(
        `INSERT INTO memory (type, dates, name, summary, memory_start, memory_end, trip_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          memory.type,
          memory.dates,
          memory.name,
          memory.summary,
          memory.memory_start,
          memory.memory_end,
          memory.trip_id || null
        ]
      );

      const memoryId = result.lastId;

      for (const conversationId of conversationIds) {
        await db.runAsync(
          `INSERT INTO memory_conversations (memory_id, conversation_id)
           VALUES (?, ?)`,
          [memoryId, conversationId]
        );
      }

      await db.runAsync(
        `COMMIT;`
      );
    } catch (error) {
      await db.runAsync(
        `ROLLBACK;`
      );
      throw error;
    }
  }

  public async createMemories(db: SQLiteDatabase): Promise<void> {
    try {
      const { conversations, personConversations, persons } = await this.getUnprocessedConversations(db);
      
      if (conversations.length === 0) {
        console.log('No new conversations to process');
        return;
      }

      // Group conversations by participating persons
      const conversationGroups = new Map<string, {
        conversations: Conversation[];
        persons: Person[];
      }>();
      
      for (const conversation of conversations) {
        const participantIds = personConversations
          .filter(pc => pc.conversation_id === conversation.id)
          .map(pc => pc.person_id)
          .sort()
          .join('-');
        
        if (!conversationGroups.has(participantIds)) {
          const groupPersons = persons.filter(p => 
            participantIds.split('-').includes(p.id.toString())
          );
          
          conversationGroups.set(participantIds, {
            conversations: [],
            persons: groupPersons
          });
        }
        
        conversationGroups.get(participantIds)?.conversations.push(conversation);
      }

      for (const [_, group] of conversationGroups) {
        const memory = await this.generateMemoryWithAI(
          group.conversations,
          group.persons
        );
        
        await this.saveMemory(
          db,
          memory, 
          group.conversations.map(conv => conv.id)
        );
      }

      if (conversations.length > 0) {
        this.lastProcessedTimestamp = conversations[conversations.length - 1].time_created;
      }

    } catch (error) {
      console.error('Error creating memories:', error);
      throw error;
    }
  }
}