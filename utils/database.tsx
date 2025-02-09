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
      url TEXT,
      location_id INTEGER,
      trip_summary TEXT,
      summary_vector TEXT,
      FOREIGN KEY (location_id) REFERENCES location(id)
    );`
  );

  // const experiences = [
  //   "In Goa, you wandered along the golden beaches, sipped feni at a seaside shack, visited old Portuguese churches, and watched the sun dip into the Arabian Sea as fishermen pulled in their nets.",
  //   "In Bandhavgarh, you rose before dawn for safaris, spotting tigers slinking through the tall grass, listened to the jungle wake up, and sat by the campfire at night, trading stories under a starlit sky.",
  //   "In Raipur, you strolled through the bustling markets, sampled spicy chana chaat, visited the grand Mahant Ghasidas Museum, and spent quiet evenings reminiscing at Marine Drive by the Telibandha lake.",
  // ];
  // await db.runAsync(`
  // INSERT INTO trips (trip_name, start_date, end_date, url, trip_summary)
  // VALUES
  //   ("Goa", 2023-04-04, 2023-04-08,"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fc/f0/goa.jpg?w=1400&h=1400&s=1" , "${
  //     experiences[0]
  //   }", "${sqlTextVector(experiences[0])}"),
  //   ("Bandhavgarh", 2024-01-01, 2024-01-10, "https://www.vivantahotels.com/content/dam/thrp/destinations/Bandhavgarh/Intro-16x7/Intro-16x7.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg", "${
  //     experiences[1]
  //   }", "${sqlTextVector(experiences[1])}"),
  //   ("Raipur", 2023-11-12, 2023-11-15, "https://media2.thrillophilia.com/images/photos/000/205/310/original/1589467756_shutterstock_1208258626.jpg?gravity=center&width=1280&height=642&crop=fill&quality=auto&fetch_format=auto&flags=strip_profile&format=jpg&sign_url=true", "${
  //     experiences[2]
  //   }", "${sqlTextVector(experiences[2])}");
  // `);
}
