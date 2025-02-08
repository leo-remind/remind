import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite/next';
import * as faceapi from 'face-api.js';
import { getHighestMatchingFace } from './rag/rag';
import { ModelLoader } from './ModelLoader';
import * as FileSystem from 'expo-file-system';

class MediaSync {
  constructor(db) {
    this.db = db;
    this.lastSyncTime = new Date();
    this.faceDetectionNet = null;
    this.faceRecognitionNet = null;
    this.logFile = `${FileSystem.documentDirectory}face_detection_log.txt`;
    console.log('MediaSync constructor initialized with logFile:', this.logFile);
  }

  async logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    console.log('Writing log:', logMessage); // Immediate console output
    try {
      const fileUri = this.logFile;
      console.log('Log file location:', fileUri);
      
      // Ensure directory exists
      const dirPath = FileSystem.documentDirectory;
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        console.log('Creating document directory');
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.log('Creating new log file');
        await FileSystem.writeAsStringAsync(fileUri, '');
      }
      
      await FileSystem.writeAsStringAsync(fileUri, logMessage, { append: true });
      console.log('Successfully wrote to log file');
    } catch (error) {
      console.error('Error writing to log file:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        fileUri: this.logFile
      });
    }
  }

  async initialize() {
    console.log('Starting MediaSync initialization');
    await this.logToFile('Starting MediaSync initialization');
    try {
      await this.requestPermissions();
      await this.initializeFaceAPI();
      console.log('MediaSync initialization completed successfully');
      await this.logToFile('MediaSync initialization completed successfully');
    } catch (error) {
      console.error('Initialization failed:', error);
      await this.logToFile(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  async initializeFaceAPI() {
    try {
      console.log('Starting face API initialization');
      await this.logToFile('Starting face API initialization');
      
      // Debug log the model files before loading
      const debugModelDir = `${FileSystem.documentDirectory}models/`;
      const files = await FileSystem.readDirectoryAsync(debugModelDir);
      console.log('Available model files:', files);
      await this.logToFile(`Available model files: ${JSON.stringify(files)}`);
      
      // Get path to models
      const modelDir = await ModelLoader.ensureModelsCopied();
      console.log('Models copied to:', modelDir);
      await this.logToFile(`Models copied to: ${modelDir}`);
      
      // Load the models
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelDir);
      console.log('SSD MobileNet loaded successfully');
      await this.logToFile('SSD MobileNet loaded successfully');
      
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelDir);
      console.log('Face Recognition Net loaded successfully');
      await this.logToFile('Face Recognition Net loaded successfully');
      
      this.faceDetectionNet = faceapi.nets.ssdMobilenetv1;
      this.faceRecognitionNet = faceapi.nets.faceRecognitionNet;
      
      // Verify models are loaded
      console.log('Detection Net loaded:', this.faceDetectionNet.isLoaded);
      console.log('Recognition Net loaded:', this.faceRecognitionNet.isLoaded);
      await this.logToFile(`Detection Net loaded: ${this.faceDetectionNet.isLoaded}`);
      await this.logToFile(`Recognition Net loaded: ${this.faceRecognitionNet.isLoaded}`);
      
      await this.logToFile('Face detection models initialized successfully');
    } catch (error) {
      console.error('Error initializing face detection:', error);
      await this.logToFile(`Face API initialization failed: ${error.message}`);
      throw error;
    }
  }

  async requestPermissions() {
    console.log('Requesting media library permissions');
    await this.logToFile('Requesting media library permissions');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      console.error('Media Library permission denied');
      await this.logToFile('Media Library permission denied');
      throw new Error('Media Library permission denied');
    }
    console.log('Media Library permission granted');
    await this.logToFile('Media Library permission granted');
  }

  async getNewPhotos() {
    console.log('Fetching new photos since', this.lastSyncTime);
    await this.logToFile('Fetching new photos since ' + this.lastSyncTime);
    const assets = await MediaLibrary.getAssetsAsync({
      first: 30,
      mediaType: ['photo'],
      createdAfter: this.lastSyncTime.getTime(),
      sortBy: [MediaLibrary.SortBy.creationTime]
    });
    console.log(`Found ${assets.assets.length} new photos`);
    await this.logToFile(`Found ${assets.assets.length} new photos`);
    return assets;
  }

  async findNearestLocation(creationTime) {
    const result = await this.db.getFirstAsync(`
      SELECT id 
      FROM location 
      WHERE ABS(STRFTIME('%s', time_of_polling) - STRFTIME('%s', ?)) = (
        SELECT MIN(ABS(STRFTIME('%s', time_of_polling) - STRFTIME('%s', ?)))
        FROM location
        WHERE time_of_polling BETWEEN datetime(?, '-1 hour') AND datetime(?, '+1 hour')
      )
      LIMIT 1
    `, [creationTime, creationTime, creationTime, creationTime]);
    
    return result?.id || null;
  }

  async createNewPerson(faceDescriptor) {
    try {
      console.log('Creating new person');
      const result = await this.db.executeAsync(
        `INSERT INTO persons (
          name,
          face_embedding
        ) VALUES (?, ?)
        RETURNING id`,
        [
          'Untitled Person',
          Buffer.from(faceDescriptor)
        ]
      );
      
      console.log('Created new person with ID:', result[0].id);
      await this.logToFile(`Created new person with ID: ${result[0].id}`);
      return result[0].id;
    } catch (error) {
      console.error('Error creating new person:', error);
      await this.logToFile(`Error creating new person: ${error.message}`);
      throw error;
    }
  }

  async detectFacesAndMatch(imageBlob) {
    console.log('Starting face detection and matching');
    await this.logToFile('Starting face detection and matching');
    const img = await faceapi.bufferToImage(imageBlob);
    
    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    console.log(`Detected ${detections.length} faces in image`);
    await this.logToFile(`Detected ${detections.length} faces in image`);

    const personIds = await Promise.all(
      detections.map(async (detection, index) => {
        const faceDescriptor = Array.from(detection.descriptor);
        console.log(`Processing face ${index + 1}/${detections.length}`);
        await this.logToFile(`Processing face ${index + 1}/${detections.length}`);
        
        let personId = await getHighestMatchingFace(this.db, new Float32Array(faceDescriptor), 0.75);
        
        if (personId === null) {
          personId = await this.createNewPerson(faceDescriptor);
          console.log(`Created new person with ID: ${personId}`);
          await this.logToFile(`Created new person with ID: ${personId}`);
        } else {
          console.log(`Matched with existing person ID: ${personId}`);
          await this.logToFile(`Matched with existing person ID: ${personId}`);
        }
        
        return personId;
      })
    );

    console.log(`Face detection and matching completed. Found ${personIds.length} matches`);
    await this.logToFile(`Face detection and matching completed. Found ${personIds.length} matches`);
    return personIds;
  }

  async processPhoto(asset) {
    let photoId = null;
    try {
      console.log(`Processing photo asset: ${asset.id}`);
      await this.logToFile(`Processing photo asset: ${asset.id}`);
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      console.log(`Photo URI: ${assetInfo.uri}`);
      await this.logToFile(`Photo URI: ${assetInfo.uri}`);

      const response = await fetch(assetInfo.uri);
      const blob = await response.blob();
      const creationTime = new Date(asset.creationTime).toISOString();
      
      console.log(`Photo creation time: ${creationTime}`);
      await this.logToFile(`Photo creation time: ${creationTime}`);
      const locationId = await this.findNearestLocation(creationTime);

      const result = await this.db.executeAsync(
        `INSERT INTO photos (
          blob_data, 
          caption, 
          caption_vector, 
          location_id,
          creation_time
        ) VALUES (?, ?, ?, ?, ?)
        RETURNING id`,
        [
          blob,
          asset.filename || `Photo_${asset.id}`,
          new ArrayBuffer(384),
          locationId,
          creationTime
        ]
      );

      photoId = result[0].id;
      console.log(`Inserted photo with ID: ${photoId}`);
      await this.logToFile(`Inserted photo with ID: ${photoId}`);
      
      if (!photoId) {
        throw new Error('Failed to get photo_id from insert operation');
      }

      const matchedPersonIds = await this.detectFacesAndMatch(blob);
      console.log(`Found ${matchedPersonIds.length} person matches for photo ${photoId}`);
      await this.logToFile(`Found ${matchedPersonIds.length} person matches for photo ${photoId}`);

      for (const personId of matchedPersonIds) {
        await this.db.executeAsync(
          `INSERT INTO person_photos (person_id, photo_id) 
           VALUES (?, ?)`,
          [personId, photoId]
        );
        console.log(`Stored match: person_id=${personId}, photo_id=${photoId}`);
        await this.logToFile(`Stored match: person_id=${personId}, photo_id=${photoId}`);
      }

      if (!locationId) {
        console.log(`No matching location found for photo taken at ${creationTime}`);
        await this.logToFile(`No matching location found for photo taken at ${creationTime}`);
      }
    } catch (error) {
      console.error(`Error processing photo ${asset.id}${photoId ? ` (photo_id: ${photoId})` : ''}:`, error);
      await this.logToFile(`Error processing photo ${asset.id}${photoId ? ` (photo_id: ${photoId})` : ''}: ${error.message}`);
    }
  }

  async syncPhotos() {
    try {
      console.log('Starting photo sync');
      await this.logToFile('Starting photo sync');
      const assets = await this.getNewPhotos();
      for (const asset of assets.assets) {
        await this.processPhoto(asset);
      }
      this.lastSyncTime = new Date();
      console.log('Photo sync completed');
      await this.logToFile('Photo sync completed');
    } catch (error) {
      console.error('Photo sync failed:', error);
      await this.logToFile(`Photo sync failed: ${error.message}`);
    }
  }

  async checkLogs() {
    try {
      console.log('Attempting to read logs from:', this.logFile);
      const fileInfo = await FileSystem.getInfoAsync(this.logFile);
      console.log('Log file exists:', fileInfo.exists);
      
      if (!fileInfo.exists) {
        console.log('No log file found');
        return 'No logs available';
      }
      
      const logs = await FileSystem.readAsStringAsync(this.logFile);
      console.log('Successfully read logs, length:', logs.length);
      return logs;
    } catch (error) {
      console.error('Error reading logs:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        fileUri: this.logFile
      });
      return `Error reading logs: ${error.message}`;
    }
  }

  async checkDatabase() {
    try {
      console.log('Checking database status');
      const persons = await this.db.getAllAsync('SELECT * FROM persons');
      const photos = await this.db.getAllAsync('SELECT * FROM photos');
      const matches = await this.db.getAllAsync('SELECT * FROM person_photos');
      
      const status = {
        persons: persons.length,
        photos: photos.length,
        matches: matches.length
      };
      
      console.log('Database status:', status);
      await this.logToFile(`Database status:
        Persons: ${persons.length}
        Photos: ${photos.length}
        Matches: ${matches.length}`);
        
      return { persons, photos, matches };
    } catch (error) {
      console.error('Error checking database:', error);
      await this.logToFile(`Error checking database: ${error.message}`);
      throw error;
    }
  }

  async testFaceDetection(imageUri) {
    try {
      console.log(`Testing face detection on image: ${imageUri}`);
      await this.logToFile(`Testing face detection on image: ${imageUri}`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const faces = await this.detectFacesAndMatch(blob);
      console.log('Test detection result:', faces);
      await this.logToFile(`Test detection result: ${JSON.stringify(faces)}`);
      return faces;
    } catch (error) {
      console.error('Face detection test failed:', error);
      await this.logToFile(`Face detection test failed: ${error.message}`);
      throw error;
    }
  }
}

export default function MediaSyncComponent() {
  const db = useSQLiteContext();
  const [sync, setSync] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState('');

  useEffect(()