import * as SQLite from "expo-sqlite";
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { chat, createTextEmbedding } from './rag/rag';

export async function insertDummyConversations(db: SQLiteDatabase) {
    console.log("cooking")
    console.log("ligma")

    const dummyConversations = [
        { summary: "User engaged in an in-depth discussion about the potential advancements in artificial intelligence over the next decade, focusing on emerging trends and their implications for various industries.", transcript_start: "2025-02-01 10:00:00", transcript_end: "2025-02-01 10:30:00" ,location_id: 5 },
        { summary: "I really like dogs & terriers, especially the blue kind, like I talked with pranjal about, they are the best kind of dogs I have ever seen and I love them", transcript_start: "2025-02-02 15:00:00", transcript_end: "2025-02-02 15:45:00", location_id: 2 },
        { summary: "Brainstorming session where a team explored innovative AI-driven startup ideas, discussing potential applications, business models, and technological feasibility.", transcript_start: "2025-02-03 18:00:00", transcript_end: "2025-02-03 19:00:00", location_id: 3 },
        { summary: "I dont like cats as they don't have any real world applications, unlike dogs which are much more superior in every way, no cat lover will ever know about it", transcript_start: "2025-02-04 09:00:00", transcript_end: "2025-02-04 09:45:00",  location_id: 1 },
        { summary: "An exploration of AI use cases in financial markets, covering algorithmic trading, fraud detection, and risk assessment strategies that leverage machine learning.", transcript_start: "2025-02-05 14:30:00", transcript_end: "2025-02-05 15:15:00", location_id: 4 },
        { summary: "An introduction to generative AI models such as GANs and VAEs, with an emphasis on their applications in content creation, deepfake generation, and data augmentation.", transcript_start: "2025-02-06 11:00:00", transcript_end: "2025-02-06 11:45:00", location_id: 6 },
        { summary: "Ethical concerns in the development of autonomous driving technology, including safety considerations, liability issues, and regulatory challenges.", transcript_start: "2025-02-07 13:00:00", transcript_end: "2025-02-07 13:50:00", location_id: 2 },
        { summary: "Application of AI in natural disaster prediction, analyzing how machine learning models can enhance early warning systems for earthquakes, hurricanes, and floods.", transcript_start: "2025-02-08 16:00:00", transcript_end: "2025-02-08 16:40:00", location_id: 3 },
        { summary: "Exploration of AI's impact on mental health diagnostics and treatment recommendations, with discussions on personalized therapy and chatbot-based counseling.", transcript_start: "2025-02-09 10:30:00", transcript_end: "2025-02-09 11:15:00", location_id: 5 },
        { summary: "A conversation about data privacy concerns in AI, focusing on GDPR compliance, anonymization techniques, and user consent frameworks.", transcript_start: "2025-02-10 17:00:00", transcript_end: "2025-02-10 17:45:00", location_id: 4 },
        { summary: "Use of AI in criminal investigations, including facial recognition technology, predictive policing, and ethical considerations regarding surveillance.", transcript_start: "2025-02-11 12:00:00", transcript_end: "2025-02-11 12:30:00", location_id: 6 },
        { summary: "AI-driven automation in manufacturing and supply chain optimization, including predictive maintenance, robotic process automation, and warehouse logistics.", transcript_start: "2025-02-12 14:00:00", transcript_end: "2025-02-12 14:45:00", location_id: 1 },
        { summary: "Exploring how AI can personalize education by adapting learning experiences to individual student needs, leveraging natural language processing and reinforcement learning.", transcript_start: "2025-02-13 09:30:00", transcript_end: "2025-02-13 10:00:00", location_id: 2 },
        { summary: "A discussion on the broader societal impact of AI on employment trends, addressing concerns about job displacement and the emergence of new AI-driven roles.", transcript_start: "2025-02-14 11:15:00", transcript_end: "2025-02-14 12:00:00", location_id: 3 },
        { summary: "Deep dive into AI-powered recommendation systems used in e-commerce, entertainment, and social media, analyzing techniques like collaborative filtering and content-based recommendations.", transcript_start: "2025-02-15 16:45:00", transcript_end: "2025-02-15 17:30:00", location_id: 5 }
    ];

    console.log("start to cook")
    for (const convo of dummyConversations) {
        try {
        const summaryVector = new Float32Array(await createTextEmbedding(convo.summary));
        await db.execAsync(
            `INSERT INTO conversations (summary, summary_vector, transcript_start, transcript_end, location_id)
             VALUES ("${convo.summary}", "[${summaryVector}]", "${convo.transcript_start}", "${convo.transcript_end}", "${convo.location_id}")`);

        console.log("YAY")
        } catch (err) {
            console.log(err)
        }
    }
    
    let reply  = await chat(db,"What were the things I talked about regarding AI");
    console.log("reply: "+reply)
    console.log()

}
