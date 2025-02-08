import { HfInference } from "@huggingface/inference";

function chat(query: string) {

}

function retrieve() {

}

function generate() {

}

async function create_photo_embeddings(image: Blob) {
    const inference = new HfInference(HF_TOKEN);
    const result = await inference.imageToText({
        data: image,
        model: "Salesforce/blip-image-captioning-base",
    });
    console.log(result.generated_text);
}