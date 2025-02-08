import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

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

      // List of model files
      const modelFiles = [
        'ssd_mobilenetv1_model-weights_manifest.json',
        'ssd_mobilenetv1_model-shard1',
        'face_recognition_model-weights_manifest.json',
        'face_recognition_model-shard1'
      ];

      // Copy each model file
      for (const fileName of modelFiles) {
        const filePath = `${modelDir}${fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (!fileInfo.exists) {
          console.log(`Copying model file: ${fileName}`);
          const asset = Asset.fromModule(require(`../assets/models/${fileName}`));
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