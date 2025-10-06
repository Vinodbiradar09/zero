import { NextRequest, NextResponse } from "next/server";
import { OramaManager } from "@/lib/orama";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
// import { getSubscriptionStatus } from "@/lib/stripe-actions";
import { FREE_CREDITS_PER_DAY } from "@/app/constants";
import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req : NextRequest) {
    try {
        const {userId} = await auth();
        if(!userId){
            return NextResponse.json({ error: "Unauthorized User , Please login" }, { status: 401 });
        }
        // const isSubscribed = await getSubscriptionStatus()


        const {messages , accountId} = await req.json();
        if(!messages || !accountId){
            return NextResponse.json({
                error : "Messages and account id is required",
            },{status : 400})
        }
        const oramaManager = new OramaManager(accountId);
        await oramaManager.initialize();
        const lastMessage = messages[messages.length - 1];

        const lastMessageText = lastMessage.parts
            ? lastMessage.parts
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join(' ')
            : lastMessage.content;

            const context = await oramaManager.vectorSearch({prompt : lastMessageText});
            console.log(context.hits.length + 'hits found');
            const systemPrompt = `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
            THE TIME NOW IS ${new Date().toLocaleString()}

            START CONTEXT BLOCK
            ${context.hits.map((hit) => JSON.stringify(hit.document)).join('\n')}
            END OF CONTEXT BLOCK

            When responding, please keep in mind:
            - Be helpful, clever, and articulate.
            - Rely on the provided email context to inform your responses.
            - If the context does not contain enough information to answer a question, politely say you don't have enough information.
            - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
            - Do not invent or speculate about anything that is not directly supported by the email context.
            - Keep your responses concise and relevant to the user's questions or the email being composed.`;

            const result = await streamText({
                model : google('gemini-2.5-pro'),
                system : systemPrompt,
                messages : convertToModelMessages(messages),
                onFinish : async ()=>{
                    const today = new Date().toDateString();
                    await db.chatbotInteraction.update({
                        where : {
                            userId,
                            day : today,
                        },
                        data : {
                            count : {
                                increment : 1,
                            }
                        }
                    })

                }
            });

            return result.toUIMessageStreamResponse();
    } catch (error) {
        console.log("error in the chat route" , error);
        return NextResponse.json({ error: "error in the chat box" }, { status: 500 });
    }
}