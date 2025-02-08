import { createImageEmbedding } from "./rag";

async function fetchImageBlob(url: string): Promise<Blob> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        return await response.blob();
    } catch (error) {
        console.error("Error fetching image:", error);
        throw error;
    }
}

export async function testImageVector() {
    let data = await fetchImageBlob("https://m.media-amazon.com/images/I/81DIUl8LA0S.jpg")
    let embedding = await createImageEmbedding(data);
    console.log(embedding);
}