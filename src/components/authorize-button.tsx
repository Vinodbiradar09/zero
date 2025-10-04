"use client"
import React from 'react'
import { getAurinkoAuthorizationUrl } from '@/lib/aurinko';
import { Button } from './ui/button';
import { useLocalStorage } from 'usehooks-ts';
import { api } from '@/trpc/react';

export default function AuthoriseButton(){
  const [accountId, setAccountId] = useLocalStorage('accountId', '');
  return (
    <div>
        <Button>
            Sync Emails
        </Button>

        <Button size='sm' variant={'outline'} onClick={async()=>{
            const url = await getAurinkoAuthorizationUrl("Google")
            window.location.href = url;
        }}>
            Authorize Email
        </Button>
    </div>
  )
}


