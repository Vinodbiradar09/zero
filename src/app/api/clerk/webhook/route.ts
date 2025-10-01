import { db } from "@/server/db";
import { Webhook } from 'svix';
import { headers } from 'next/headers';


export const POST = async(req : Request) =>{
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing svix headers', { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    let evt;
    try {
        evt = wh.verify(body,{
            "svix-id" : svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        })
    } catch (error) {
        console.error('Error verifying webhook:', error);
        return new Response('Error: Verification failed', { status: 400 });
    }
    const {data , type} = evt as any;
    console.log("clerk webhook verified" , type);
    console.log("clerk webhook received" , data);

    if(type === 'user.created' || type === 'user.updated'){
        const emailAddress = data.email_addresses[0]?.email_address || `${data.id}@test.local`;
        const firstName = data.first_name;
        const lastName = data.last_name;
        const imageUrl = data.image_url;
        const id = data.id;

        await db.user.upsert({
        where : {
            id,
        },
        update : {
            emailAddress,
            firstName,
            lastName,
            imageUrl
        },
        create : {
            id,
            emailAddress,
            firstName,
            lastName,
            imageUrl
        }
    });
    console.log("User synced to database:", id);
}
   return new Response('Webhook received' , {status : 200});
}