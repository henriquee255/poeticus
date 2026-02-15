import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET() {
    try {
        const res = await fetch(
            `${SUPA_URL}/rest/v1/feed_posts?order=created_at.desc&select=*,profiles(username,avatar_url)`,
            { headers: h }
        )
        const data = await res.json()
        return NextResponse.json(Array.isArray(data) ? data : [])
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { user_id, content } = await request.json()
        if (!user_id || !content?.trim()) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
        }

        const res = await fetch(`${SUPA_URL}/rest/v1/feed_posts`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'return=representation' },
            body: JSON.stringify({ user_id, content: content.trim() })
        })
        const data = await res.json()
        return NextResponse.json(data[0] || {})
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
