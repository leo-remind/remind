import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
// directly import model files
import ssdModelManifest from '../assets/models/ssd_mobilenetv1_model-weights_manifest.json';
import ssdModelShard from '../assets/models/ssd_mobilenetv1_model-shard1';
import faceModelManifest from '../assets/models/face_recognition_model-weights_manifest.json';
import faceModelShard from '../assets/models/face_recognition_model-shard1';

export class ModelLoader {
  static async ensureModelsCopied() {
    const modelDir = `${FileSystem.documentDirectory}models/`;
    
    try {
      // Check if models directory exists
      const dirInfo = await FileSystem.getInfoAsync(modelDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
        console.log('Created models directory');
      }

      // Map of model files with their imports
      const modelFiles = [
        { name: 'ssd_mobilenetv1_model-weights_manifest.json', module: ssdModelManifest },
        { name: 'ssd_mobilenetv1_model-shard1', module: ssdModelShard },
        { name: 'face_recognition_model-weights_manifest.json', module: faceModelManifest },
        { name: 'face_recognition_model-shard1', module: faceModelShard }
      ];

      // Copy each model file
      for (const { name, module } of modelFiles) {
        const filePath = `${modelDir}${name}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (!fileInfo.exists) {
          console.log(`Copying model file: ${name}`);
          const asset = Asset.fromModule(module);
          await asset.downloadAsync();
          await FileSystem.copyAsync({
            from: asset.localUri,
            to: filePath
          });
        }
      }

      return modelDir;
    } catch (error) {
      console.error('Error in ensureModelsCopied:', error);
      throw error;
    }
  }
}