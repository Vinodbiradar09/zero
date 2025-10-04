"use server";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import type { EmailMessage } from "./types";

export const getAurinkoAuthorizationUrl = async (serviceType: "Google" | "Office365") => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const user = await db.user.findUnique({
    where : {
        id : userId,
    },
    select : {
        role : true
    }
  })

  if(!user){
    throw new Error("user not found");
  }

  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID as string,
    serviceType,
    scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

// when we try to login or connect your email it sends the success and code now the code should be sent to the aurinko to get the access token
export const getAurinkoToken = async (code: string) => {
    try {
        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`,
            {},
            {
                auth: {
                    username: process.env.AURINKO_CLIENT_ID as string,
                    password: process.env.AURINKO_CLIENT_SECRET as string,
                }
            }
        );

        return response.data as {
            accountId: number,
            accessToken: string,
            userId: string,
            userSession: string
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching Aurinko token:', error.response?.data);
        } else {
            console.error('Unexpected error fetching Aurinko token:', error);
        }
    }
}

// to get the account details 

export const getAccountDetails = async(accessToken : string)=>{
    try {
        const respone = await axios.get('https://api.aurinko.io/v1/account' , {
            headers : {
                "Authorization" : `Bearer ${accessToken}`,
            }
        });
        return respone.data as {
            email : string,
            name : string,
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching account details:', error.response?.data);
        } else {
            console.error('Unexpected error fetching account details:', error);
        }
        throw error;
    }
}

// to get the email details

export const getEmailDetails = async(accessToken : string , emailId : string)=>{
    try {
        const respone = await axios.get<EmailMessage>(`https://api.aurinko.io/v1/email/messages/${emailId}` , {
              params: {
                loadInlines: true
            },
            headers : {
                "Authorization" : `Bearer ${accessToken}`,
            }
        });
        return respone.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching email details:', error.response?.data);
        } else {
            console.error('Unexpected error fetching email details:', error);
        }
        throw error;
    }
}