import { getAurinkoToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {waitUntil} from "@vercel/functions";
import axios from "axios";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized user, please login" }, { status: 401 });
  }
  const user = await db.user.findUnique({
    where : {
        id : userId,
    },
    select : {
        role : true,
    }
  })
  if(!user){
    return NextResponse.json({
        error : "User not found in database",
    },{status : 404})
  }
  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  const type = params.get("type");
  const code = params.get("code");

  if (status !== "success" || type !== "accountAuthResult") {
    return NextResponse.json({ error: "Aurinko authorization failed" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Aurinko code not found" }, { status: 400 });
  }

  const token = await getAurinkoToken(code);
  if (!token) {
    return NextResponse.json({ error: "Failed to fetch Aurinko token" }, { status: 400 });
  }


  const accountDetails = await getAccountDetails(token.accessToken);
  if (!accountDetails.email || !accountDetails.name) {
    return NextResponse.json({ error: "Account details not found" }, { status: 400 });
  }

  
   await db.account.upsert({
        where: { id: token.accountId.toString() },
        create: {
            id: token.accountId.toString(),
            userId,
            token: token.accessToken,
            provider: 'Aurinko',
            emailAddress: accountDetails.email,
            name: accountDetails.name
        },
        update: {
            token: token.accessToken,
        }
    })

waitUntil(
  axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync` , {
    accountId : token.accountId.toString(),
    userId,
  }).then((response)=>{
    console.log("initial sync is triggred", response.data)
  }).catch((error)=>{
    console.log("error in initial email syncing" , error);
  })
);

  return NextResponse.redirect(new URL("/mail", req.url));
};
