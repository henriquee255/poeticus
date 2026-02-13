"use client"

import { useState, useEffect } from "react"
import { getNotifications } from "@/lib/storage"
import { Notification } from "@/types"
import { X, Info, AlertTriangle, CheckCircle, Bell } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function NotificationBanner() {
    const [notification, setNotification] = useState<Notification | null>(null)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const notes = await getNotifications()
                const active = notes.find((n: Notification) => n.active)
                setNotification(active || null)
            } catch (error) {
                console.error("Error fetching notifications:", error)
            }
        }

        fetchNote()
    }, [])

    if (!notification || !isVisible) return null

    const getIcon = () => {
        switch (notification.type) {
            case 'info': return <Info className="w-4 h-4" />
            case 'warning': return <AlertTriangle className="w-4 h-4" />
            case 'success': return <CheckCircle className="w-4 h-4" />
            default: return <Bell className="w-4 h-4" />
        }
    }

    const getColors = () => {
        switch (notification.type) {
            case 'info': return "bg-blue-900/90 text-blue-200 border-blue-500/20"
            case 'warning': return "bg-orange-900/90 text-orange-200 border-orange-500/20"
            case 'success': return "bg-emerald-900/90 text-emerald-200 border-emerald-500/20"
            default: return "bg-purple-900/90 text-purple-200 border-purple-500/20"
        }
    }

    return (
        <div className={cn(
            "relative z-[60] backdrop-blur-sm border-b px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium transition-colors",
            getColors()
        )}>
            <div className="flex items-center gap-2">
                {getIcon()}
                <span>{notification.text}</span>
            </div>

            {notification.link && (
                <Link href={notification.link} className="underline underline-offset-4 hover:opacity-80">
                    Saiba mais
                </Link>
            )}

            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
