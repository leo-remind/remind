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
    let data = await fetchImageBlob("https://prdaficalmjediwestussa.blob.core.windows.net/images/2020/07/AFI20_THE_MATRIX_Social-Assets_B_v1_2_BLOG.jpg")
    let embedding = await createImageEmbedding(data);
    console.log(embedding);
}