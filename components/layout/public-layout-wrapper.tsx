"use client"

import { usePathname } from "next/navigation"

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith('/admin')

    if (isAdmin) return null

    return <>{children}</>
}
