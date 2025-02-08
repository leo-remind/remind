import OpenAI from "openai"
import axios from "axios";
import { Buffer } from "buffer";
import { type SQLiteDatabase } from "expo-sqlite";
import * as FileSystem from 'expo-file-system'
import { Asset } from "expo-asset";

import env from "../.env.json"


const CONCATENATION_SERVER_URL = "http://10.0.2.2:8000/concatenate-wav/"
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
})

interface SarvamEntry {
  transcript: string,
  start_time_seconds: number,
  end_time_seconds: number,
  speaker_id: string
}

export const addDummyData = async (db: SQLiteDatabase) => {
  try {
    console.log("adding dummy data: started");
    await db.runAsync("DELETE FROM persons;")

    const [{ localUri }] = await Asset.loadAsync(require("../assets/audio/arb.wav"))
    const [{ localUri: localUri2 }] = await Asset.loadAsync(require("../assets/audio/pjr.wav"))
    const [{ localUri: localUriAmerica }] = await Asset.loadAsync(require("../assets/audio/america.wav"))
    if (!localUri || !localUri2 || !localUriAmerica) {
      console.log("no uri");
      return
    }
    const audioFileURI = FileSystem.documentDirectory + "arb.wav";
    const audioFileURI2 = FileSystem.documentDirectory + "pjr.wav";
    const audioFileURIAmer = FileSystem.documentDirectory + "america.wav";
    await FileSystem.copyAsync({
      from: localUri,
      to: audioFileURI
    })

    await FileSystem.copyAsync({
      from: localUri2,
      to: audioFileURI2
    })
    await FileSystem.copyAsync({
      from: localUriAmerica,
      to: audioFileURIAmer
    })

    const audioDataB64 = await FileSystem.readAsStringAsync(audioFileURI, {
      encoding: FileSystem.EncodingType.Base64
    });

    const audioData = new Uint8Array(Buffer.from(audioDataB64, "base64"));

    const audioDataB642 = await FileSystem.readAsStringAsync(audioFileURI2, {
      encoding: FileSystem.EncodingType.Base64
    });

    const audioData2 = new Uint8Array(Buffer.from(audioDataB642, "base64"));


    await db.runAsync(`
    INSERT INTO PERSONS (name, birthdate, relation, speech_embedding)
    VALUES ("Arbaaz Shafiq", 2003-05-13, "Father", ?),
    ("Pranjal Rastogi", 2002-04-12, "Uncle", ?);
  `, audioData, audioData2);
    console.log("added dummy data");
  } catch (error) {
    console.log(error)
  }
}

export const queryDummyData = async (db: SQLiteDatabase): Promise<any> => {
  console.log("querying dummy data");
  console.log("persons:", await db.getAllAsync("SELECT COUNT(*) FROM persons;"));
  await tryAddConv(db);
  return db.getAllAsync("SELECT * FROM persons;")
}

const tryAddConv = async (db: SQLiteDatabase) => {
  const audioFileURI = FileSystem.documentDirectory + "america.wav";

  const audioDataB64 = await FileSystem.readAsStringAsync(audioFileURI, {
    encoding: FileSystem.EncodingType.Base64
  });

  const audioData = new Uint8Array(Buffer.from(audioDataB64, "base64"));

  console.log("adding conv")
  await addConversation(db, audioData, '', '')
  console.log("adding conv done")
  console.log("convos:", await db.getAllAsync("SELECT * FROM conversations;"))
  console.log("convos:", await db.getAllAsync("SELECT * FROM person_conversations; "))
}

const wavToBlob = (arr: Uint8Array, fname: string): Blob => {
  const b64d = Array.from(arr)
    .map(byte => String.fromCharCode(byte))
    .join('');

  const b64s = btoa(b64d);
  return {
    uri: `data:audio/wav;base64,${b64s}`,
    name: fname,
    type: "audio/wav"
  } as unknown as Blob
}


const generateConvSummary = async (convo: string, user: string): Promise<string | null> => {
  const contentString = `The Primary Person is ${user}\n===CONVERSATION BEGIN===\n${convo}\n===CONVERSATION END===\n`

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that summrizes the conversations that the Primary Person is having. Summarize the given conversation."
      },
      {
        role: "user",
        content: contentString
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return completion.choices[0].message.content
}
export const addConversation = async (db: SQLiteDatabase, convo: Uint8Array, transcriptStart: string, transcriptEnd: string): Promise<boolean> => {
  try {
    const persons: { 'id': number, 'name': string, 'speech_embedding': Uint8Array }[] = await db.getAllAsync("SELECT * FROM persons");
    const ret: { 'name': string } | null = await db.getFirstAsync("SELECT * FROM persons WHERE id = 0;")
    const userName = ret ? ret.name : "person_0";
    console.log("user is", userName)

    const formData = new FormData()
    for (let person of persons) {
      formData.append("files", wavToBlob(person.speech_embedding, `${person.id}.wav`))
    }

    formData.append("files", wavToBlob(convo, "convo.wav"))

    const response = await axios.post(
      CONCATENATION_SERVER_URL,
      formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'json'
    })

    console.log("received response from sarvam")
    const entries: SarvamEntry[] = response.data.diarized_transcript.entries

    let mapping: Map<string, { 'id': number, 'name': string }> = new Map()
    let idx = 0;
    for (let person of persons) {
      mapping.set(entries[idx].speaker_id, { id: person.id, name: person.name })
      console.log("setting", entries[idx].speaker_id, { id: person.id, name: person.name })
      idx += 1
    }

    console.log("building convoarr")
    let convoArr = []
    for (; idx < entries.length; idx++) {
      const who = mapping.get(entries[idx].speaker_id);
      convoArr.push(`${who ? who.name : entries[idx].speaker_id}: ${entries[idx].transcript}`)
    }

    let fullConvo = convoArr.join("\n\n")
    const summary = await generateConvSummary(fullConvo, userName)
    console.log("summarized:", summary)
    const insertionResult = await db.runAsync(`
      INSERT INTO conversations (summary, summary_vector, transcript_start, transcript_end)
      VALUES (?, ?, ?, ?);
    `, summary || "", new Uint8Array(), transcriptStart, transcriptEnd);
    console.log("inserted into", insertionResult.lastInsertRowId)


    for (let [_, value] of mapping) {
      console.log(value.name, "is involved in convo")
      await db.runAsync("INSERT INTO person_conversations (person_id, conversation_id) VALUES (?, ?);", value.id, insertionResult.lastInsertRowId);
    }
    return true

  } catch (error) {
    console.log(`errored ${error}`, JSON.stringify(error))
    return false
  }
}
