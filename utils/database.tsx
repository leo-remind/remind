import * as SQLite from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      summary TEXT NOT NULL,
      summary_vector TEXT NOT NULL,
      time_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      transcript_start TIMESTAMP NOT NULL,
      transcript_end TIMESTAMP NOT NULL,
      location_id INTEGER,
      FOREIGN KEY (location_id) REFERENCES location(id)
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS location (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_name TEXT NOT NULL,
      time_of_polling TIMESTAMP,
      lat REAL NOT NULL,
      lon REAL NOT NULL
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      summary TEXT NOT NULL,
      memory_start TIMESTAMP NOT NULL,
      memory_end TIMESTAMP NOT NULL,
      trip_id INTEGER,
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS memory_conversations (
      memory_id INTEGER NOT NULL,
      conversation_id INTEGER NOT NULL,
      PRIMARY KEY (memory_id, conversation_id),
      FOREIGN KEY (memory_id) REFERENCES memory(id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS memory_photos (
      memory_id INTEGER NOT NULL,
      photo_id INTEGER NOT NULL,
      PRIMARY KEY (memory_id, photo_id),
      FOREIGN KEY (memory_id) REFERENCES memory(id),
      FOREIGN KEY (photo_id) REFERENCES photos(id)
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NULL,
      birthdate DATE NULL,
      relation TEXT NULL,
      audio BLOB NULL,
      face_embedding BLOB,
      photo_data BLOB
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blob_data BLOB NOT NULL,
      time_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      caption TEXT NULL,
      caption_vector BLOB NULL,
      location_id INTEGER,
      FOREIGN KEY (location_id) REFERENCES location(id)
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reminder_time TIMESTAMP NOT NULL,
      recurrencetype TEXT NOT NULL,
      recurrenceon TEXT NOT NULL,
      recurrencefrequency INTEGER NOT NULL,
      recurrenceends TIMESTAMP,
      subtitle TEXT,
      reminder_text TEXT NOT NULL
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS person_photos (
      person_id INTEGER NOT NULL,
      photo_id INTEGER NOT NULL,
      PRIMARY KEY (person_id, photo_id),
      FOREIGN KEY (person_id) REFERENCES persons(id),
      FOREIGN KEY (photo_id) REFERENCES photos(id)
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS person_conversations (
      person_id INTEGER NOT NULL,
      conversation_id INTEGER NOT NULL,
      PRIMARY KEY (person_id, conversation_id),
      FOREIGN KEY (person_id) REFERENCES persons(id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_name TEXT NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      location_id INTEGER,
      trip_summary TEXT,
      FOREIGN KEY (location_id) REFERENCES location(id)
    );`
  );
}
