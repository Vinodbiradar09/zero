import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function getEmbeddings(text : string) {
    try {
        const model = genAI.getGenerativeModel({model : "text-embedding-004"});
        const result = await model.embedContent(text.replace(/\n/g, " "));
        return result.embedding.values as number [];
    } catch (error) {
        console.log("error calling gemini embeddings api", error);
        throw error;
    }
}

// this is the function for generating the embeddings 