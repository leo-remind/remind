import { SQLiteDatabase } from 'expo-sqlite';

export async function populateDummyData(db: SQLiteDatabase) {

  console.log("Adding dummy data");
  
  // // Insert locations
  // const locationInserts = [
  //   ["Marine Drive", 18.9432, 72.8235],
  //   ["Taj Mahal", 27.1751, 78.0421],
  //   ["India Gate", 28.6129, 77.2295],
  //   ["Gateway of India", 18.9217, 72.8347],
  //   ["Hawa Mahal", 26.9239, 75.8267],
  //   ["Mysore Palace", 12.3052, 76.6552],
  //   ["Golden Temple", 31.6200, 74.8765],
  //   ["Varanasi Ghats", 25.3176, 83.0064],
  //   ["Qutub Minar", 28.5245, 77.1855],
  //   ["Victoria Memorial", 22.5448, 88.3426]
  // ];

  // for (const [place_name, lat, lon] of locationInserts) {
  //   await db.execAsync(`
  //     INSERT INTO location (place_name, lat, lon, time_of_polling)
  //     VALUES (?, ?, ?, datetime('now'))
  //   `, [place_name, lat, lon]);
  // }

  // // Insert persons with Indian names
  // const personInserts = [
  //   ["Aarav Kumar", "1990-05-15", "Friend"],
  //   ["Priya Patel", "1988-12-03", "Sister"],
  //   ["Arjun Singh", "1985-08-22", "Brother"],
  //   ["Zara Khan", "1992-03-30", "Friend"],
  //   ["Rohan Mehta", "1995-11-17", "Cousin"],
  //   ["Aisha Sharma", "1993-07-25", "Friend"],
  //   ["Dev Verma", "1987-04-12", "Brother-in-law"],
  //   ["Neha Gupta", "1991-09-08", "Sister-in-law"],
  //   ["Kabir Malhotra", "1989-02-14", "College Friend"],
  //   ["Ishaan Reddy", "1994-06-28", "Colleague"],
  //   ["Ananya Kapoor", "1993-11-05", "Childhood Friend"],
  //   ["Riya Chatterjee", "1992-08-19", "Neighbor"]
  // ];

  // for (const [name, birthdate, relation] of personInserts) {
  //   await db.execAsync(`
  //     INSERT INTO persons (name, birthdate, relation)
  //     VALUES (?, ?, ?)
  //   `, [name, birthdate, relation]);
  // }

  // // Insert trips
  // const tripInserts = [
  //   ["Golden Triangle Tour", "2024-01-15", "2024-01-22", "A wonderful trip through Delhi, Agra, and Jaipur"],
  //   ["Kerala Backwaters", "2024-02-10", "2024-02-17", "Peaceful journey through God's own country"],
  //   ["Mumbai City Break", "2024-03-05", "2024-03-10", "Exploring the city of dreams"],
  //   ["Rajasthan Heritage Tour", "2024-04-01", "2024-04-10", "Royal palaces and desert adventures"],
  //   ["Varanasi Spiritual Journey", "2024-05-15", "2024-05-20", "Experiencing the spiritual heart of India"],
  //   ["Karnataka Temple Trail", "2024-06-01", "2024-06-08", "Ancient temples and architectural marvels"],
  //   ["Punjab Food Trail", "2024-07-10", "2024-07-15", "Culinary exploration of Punjab"]
  // ];

  // for (const [name, start_date, end_date, summary] of tripInserts) {
  //   await db.execAsync(`
  //     INSERT INTO trips (trip_name, start_date, end_date, trip_summary)
  //     VALUES (?, ?, ?, ?)
  //   `, [name, start_date, end_date, summary]);
  // }

  // // Insert memories
  // const memoryInserts = [
  //   ["2025-02-09", "Taj Mahal Visit", "Watching the sunrise at the magnificent Taj Mahal"],
  //   ["2025-02-09", "Houseboat Experience", "Cruising through the serene backwaters of Kerala"],
  //   ["2025-02-09", "Gateway Evening", "Beautiful sunset at Gateway of India"],
  //   ["2025-02-09", "Desert Safari", "Camel ride and camping in Jaisalmer desert"],
  //   ["2025-02-09", "Ganga Aarti", "Spiritual evening at Dashashwamedh Ghat"],
  //   ["2025-02-09", "Hampi Ruins", "Exploring the ancient ruins of Hampi"],
  //   ["2025-02-09", "Amritsar Food Walk", "Tasting authentic Punjabi street food"]
  // ];

  // for (const [date, name, summary] of memoryInserts) {
  //   await db.execAsync(`
  //     INSERT INTO memory (date, name, summary, memory_start, memory_end)
  //     VALUES (?, ?, ?, datetime(?), datetime(?, '+3 hours'))
  //   `, [date, name, summary, date, date]);
  // }

  // // Insert conversations
  // const conversationInserts = [
  //   ["Meeting with Aarav at Marine Drive", "Evening discussion about future plans"],
  //   ["Family gathering at home", "Celebrating Diwali with everyone"],
  //   ["Coffee with Priya", "Catching up after long time"],
  //   ["Dinner with Kabir", "Discussing the upcoming wedding plans"],
  //   ["Phone call with Ananya", "Planning the college reunion"],
  //   ["Lunch with colleagues", "Team bonding session at the new restaurant"],
  //   ["Video call with parents", "Weekly family catch-up"]
  // ];

  // for (const [summary, vector_summary] of conversationInserts) {
  //   await db.execAsync(`
  //     INSERT INTO conversations (summary, summary_vector, transcript_start, transcript_end)
  //     VALUES (?, ?, datetime('now'), datetime('now'))
  //   `, [summary, vector_summary]);
  // }

  // // Insert reminders
  // const reminderInserts = [
  //   ["2024-03-15 10:00:00", "DAILY", "WEEKDAY", 1, "2024-12-31", "Medicine", "Take morning medicines"],
  //   ["2024-03-20 18:00:00", "WEEKLY", "SUNDAY", 1, "2024-06-30", "Call Parents", "Weekly call with family"],
  //   ["2024-04-01 09:00:00", "MONTHLY", "1", 1, "2024-12-31", "Bill Payment", "Pay electricity bill"],
  //   ["2024-03-25 08:00:00", "DAILY", "EVERYDAY", 1, "2024-12-31", "Yoga", "Morning yoga session"],
  //   ["2024-04-05 17:00:00", "WEEKLY", "FRIDAY", 1, "2024-12-31", "Team Meeting", "Weekly team sync"],
  //   ["2024-05-01 10:00:00", "MONTHLY", "1", 1, "2024-12-31", "Rent", "Pay monthly rent"],
  //   ["2024-03-30 20:00:00", "WEEKLY", "SATURDAY", 1, "2024-12-31", "Family Dinner", "Weekly family dinner"]
  // ];

  // for (const [time, type, on, freq, ends, subtitle, text] of reminderInserts) {
  //   await db.execAsync(`
  //     INSERT INTO reminders (reminder_time, recurrencetype, recurrenceon, recurrencefrequency, recurrenceends, subtitle, reminder_text)
  //     VALUES (?, ?, ?, ?, ?, ?, ?)
  //   `, [time, type, on, freq, ends, subtitle, text]);
  // }

  // // Insert photos (with dummy data)
  // const photoInserts = [
  //   ["Taj Mahal morning view", "2024-01-16"],
  //   ["Kerala backwaters sunset", "2024-02-12"],
  //   ["Gateway of India with friends", "2024-03-07"],
  //   ["Desert camping night", "2024-04-03"],
  //   ["Varanasi Ghat ceremony", "2024-05-16"],
  //   ["Hampi temple architecture", "2024-06-03"],
  //   ["Golden Temple reflection", "2024-07-12"],
  //   ["Family Diwali celebration", "2024-11-01"]
  // ];

  // for (const [caption, date] of photoInserts) {
  //   await db.execAsync(`
  //     INSERT INTO photos (blob_data, caption, time_created)
  //     VALUES (?, ?, datetime(?))
  //   `, [Buffer.from('dummy_photo_data'), caption, date]);
  // }

  // // Create relationships between entities
  // // Link persons to photos (more comprehensive relationships)
  // await db.execAsync(`
  //   INSERT INTO person_photos (person_id, photo_id)
  //   SELECT 
  //     persons.id, 
  //     photos.id 
  //   FROM persons 
  //   CROSS JOIN photos 
  //   WHERE persons.id <= 8 AND photos.id <= 8
  // `);

  // // Link persons to conversations
  // await db.execAsync(`
  //   INSERT INTO person_conversations (person_id, conversation_id)
  //   SELECT 
  //     persons.id, 
  //     conversations.id 
  //   FROM persons 
  //   CROSS JOIN conversations 
  //   WHERE persons.id <= 7 AND conversations.id <= 7
  // `);

  // // Link memories to photos
  // await db.execAsync(`
  //   INSERT INTO memory_photos (memory_id, photo_id)
  //   SELECT 
  //     memory.id, 
  //     photos.id 
  //   FROM memory 
  //   CROSS JOIN photos 
  //   WHERE memory.id <= 7 AND photos.id <= 7
  // `);

  // // Link memories to conversations
  // await db.execAsync(`
  //   INSERT INTO memory_conversations (memory_id, conversation_id)
  //   SELECT 
  //     memory.id, 
  //     conversations.id 
  //   FROM memory 
  //   CROSS JOIN conversations 
  //   WHERE memory.id <= 7 AND conversations.id <= 7
  // `);

  console.log('Extended dummy data populated successfully');
}