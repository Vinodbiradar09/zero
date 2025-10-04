"use server";

import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
const geminiModel = google("gemini-2.5-flash");

// make sure to have the file name same as action.ts becoz next.js supports file name to be action.ts

export async function generateEmail(context: string, prompt: string) {
  console.log("context", context);
  const stream = createStreamableValue("");

  (async () => {
    const { textStream } = await streamText({
      model: geminiModel,
      prompt: `
            You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by providing suggestions and relevant information based on the context of their previous emails.
            
            THE TIME NOW IS ${new Date().toLocaleString()}
            
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            
            USER PROMPT:
            ${prompt}
            
            When responding, please keep in mind:
            - Be helpful, clever, and articulate. 
            - Rely on the provided email context to inform your response.
            - If the context does not contain enough information to fully address the prompt, politely give a draft response.
            - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
            - Do not invent or speculate about anything that is not directly supported by the email context.
            - Keep your response focused and relevant to the user's prompt.
            - Don't add fluff like 'Heres your email' or 'Here's your email' or anything like that.
            - Directly output the email, no need to say 'Here is your email' or anything like that.
            - No need to output subject
            `,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }
    stream.done();
  })();
  return { output: stream.value };
}

export async function generate(input: string) {
  const stream = createStreamableValue("");

  (async () => {
    const { textStream } = await streamText({
      model: geminiModel,
      prompt: `
ALWAYS RESPOND IN PLAIN TEXT, no html or markdown.
You are a helpful AI embedded in an email client app that is used to autocomplete sentences, similar to Google Gmail autocomplete.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is always friendly, kind, and inspiring.
Help me complete my train of thought here: <input>${input}</input>
Keep the tone of the text consistent with the rest of the text.
Keep the response short and sweet. Act like a copilot, finish my sentence if need be, but don't try to generate a whole new paragraph.
Do not add fluff like "I'm here to help you" or "I'm a helpful AI".

Your output is directly concatenated to the input, so do not add any new lines or formatting, just plain text.
`,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}

