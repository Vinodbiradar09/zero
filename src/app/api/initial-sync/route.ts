import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import Account from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";

export const maxDuration = 300;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { accountId, userId } = body;
    if (!accountId || !userId) {
      return NextResponse.json(
        {
          error: "accountId and userId slugs are missing",
        },
        { status: 404 },
      );
    }
    const dbAccount = await db.account.findUnique({
      where: {
        id: accountId,
        userId,
      },
    });
    if (!dbAccount) {
      return NextResponse.json(
        {
          error: "Account not found",
        },
        { status: 404 },
      );
    }
    const account = new Account(dbAccount.token);
    await account.createSubscription();
    const response = await account.performInitialSync();
    if (!response) {
      return NextResponse.json(
        {
          error: "Failed to sync",
        },
        { status: 400 },
      );
    }
    const { deltaToken, emails } = response;

    await syncEmailsToDatabase(emails , accountId);

    await db.account.update({
      where : {
        token : dbAccount.token,
      },
      data : {
        nextDeltaToken : deltaToken,
      }
    });

    console.log("async completed", deltaToken);

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "error in initial sync",
      },
      { status: 500 },
    );
  }
};
