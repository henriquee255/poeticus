import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params
    const res = await fetch(
        `${SUPA_URL}/rest/v1/feed_replies?post_id=eq.${id}&order=created_at.asc&select=*,profiles(username,avatar_url)`,
        { headers: h }
    )
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params
    try {
        const { user_id, content } = await request.json()
        if (!user_id || !content?.trim()) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })

        const res = await fetch(`${SUPA_URL}/rest/v1/feed_replies`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'return=representation' },
            body: JSON.stringify({ post_id: id, user_id, content: content.trim() })
        })
        const data = await res.json()
        return NextResponse.json(data[0] || {})
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('reply_id')
    if (!id) return NextResponse.json({ error: 'Missing reply_id' }, { status: 400 })
    await fetch(`${SUPA_URL}/rest/v1/feed_replies?id=eq.${id}`, { method: 'DELETE', headers: h })
    return NextResponse.json({ ok: true })
}
