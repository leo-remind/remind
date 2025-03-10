const SQL_SCHEMA = `
CREATE TABLE IF NOT EXISTS location (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_name TEXT NOT NULL,
  time_of_polling TIMESTAMP,
  lat REAL NOT NULL,
  lon REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  summary TEXT NOT NULL,
  summary_vector BLOB NOT NULL,
  time_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  transcript_start TIMESTAMP NOT NULL,
  transcript_end TIMESTAMP NOT NULL,
  person_ids TEXT,
  location_id INTEGER,
  FOREIGN KEY (location_id) REFERENCES location(id)
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_name TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location_id INTEGER,
  trip_summary TEXT,
  FOREIGN KEY (location_id) REFERENCES location(id)
);

CREATE TABLE IF NOT EXISTS memory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  dates TEXT NOT NULL,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  memory_start TIMESTAMP NOT NULL,
  memory_end TIMESTAMP NOT NULL,
  trip_id INTEGER,
  FOREIGN KEY (trip_id) REFERENCES trips(id)
);

CREATE TABLE IF NOT EXISTS memory_conversations (
  memory_id INTEGER NOT NULL,
  conversation_id INTEGER NOT NULL,
  PRIMARY KEY (memory_id, conversation_id),
  FOREIGN KEY (memory_id) REFERENCES memory(id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

CREATE TABLE IF NOT EXISTS memory_photos (
  memory_id INTEGER NOT NULL,
  photo_id INTEGER NOT NULL,
  PRIMARY KEY (memory_id, photo_id),
  FOREIGN KEY (memory_id) REFERENCES memory(id),
  FOREIGN KEY (photo_id) REFERENCES photos(id)
);

CREATE TABLE IF NOT EXISTS persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  relation TEXT NOT NULL,
  audio BLOB NOT NULL,
  face_embedding BLOB,
  photo_data BLOB
);

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blob_data BLOB NOT NULL,
  time_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  caption TEXT NOT NULL,
  caption_vector BLOB NOT NULL,
  location_id INTEGER,
  person_ids TEXT,
  FOREIGN KEY (location_id) REFERENCES location(id)
);

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminder_time TIMESTAMP NOT NULL,
  recurrencetype TEXT NOT NULL,
  recurrenceon TEXT NOT NULL,
  recurrencefrequency INTEGER NOT NULL,
  recurrenceends TIMESTAMP,
  reminder_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS person_photos (
  person_id INTEGER NOT NULL,
  photo_id INTEGER NOT NULL,
  PRIMARY KEY (person_id, photo_id),
  FOREIGN KEY (person_id) REFERENCES persons(id),
  FOREIGN KEY (photo_id) REFERENCES photos(id)
);

CREATE TABLE IF NOT EXISTS person_conversations (
  person_id INTEGER NOT NULL,
  conversation_id INTEGER NOT NULL,
  PRIMARY KEY (person_id, conversation_id),
  FOREIGN KEY (person_id) REFERENCES persons(id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
`

const CHATBOT_QUERY_PROMPT = `
You are an assistive SQL code generator for an application called ReMind, you are supposed to help us by generating SQL queries to get the required data present in the user prompt given
The response should be in JSON format with the following structure:
\`\`\`json
{
    "images": "a SQL query to get top 10 images relevant to the query"
    "people": "a SQL query to get the most relevant"

}
\`\`\`

prompt: {prompt}

Given the following SQL schema
${SQL_SCHEMA}
`
