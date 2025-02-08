import * as faceapi from 'face-api.js';

// Load the models
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'); // Face detection
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models'); // Facial landmarks
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models'); // Face embeddings
}

// Convert image blob to face embedding
async function getFaceEmbedding(imageBlob) {
    try {
        // Convert Blob to Image
        const image = await createImageFromBlob(imageBlob);

        // Detect face and extract embedding
        const detection = await faceapi.detectSingleFace(image)
            .withFaceLandmarks()
            .withFaceDescriptor(); // Get face embedding
        
        if (detection && detection.descriptor) {
            return detection.descriptor; // Face embedding as a Float32Array
        }
        
        return null;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

// Helper function: Convert Blob to Image
function createImageFromBlob(blob) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => resolve(img);
    });
}

async function main() {
    await loadModels();
    const embedding = await getFaceEmbedding(imageBlob); // pass image Blob
    console.log("Face Embedding:", embedding);
}

main();
