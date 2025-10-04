'use client'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { api } from "@/trpc/react"
import { Webhook } from "lucide-react"

import React from 'react'
import { useLocalStorage } from "usehooks-ts"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const WebhookDebugger = ()=>{
    return (
        <div>

        </div>
    )
}

export default WebhookDebugger