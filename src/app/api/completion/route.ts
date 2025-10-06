import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const result = await streamText({
            model: google('gemini-2.5-flash'), // Using flash for faster autocomplete
            system: `You are a helpful AI embedded in a notion text editor app that is used to autocomplete sentences
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.`,
            prompt: `I am writing a piece of text in a notion text editor app.
Help me complete my train of thought here: ##${prompt}##
keep the tone of the text consistent with the rest of the text.
keep the response short and sweet.`,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Error in autocomplete API:', error);
        return new Response('Error generating completion', { status: 500 });
    }
}

