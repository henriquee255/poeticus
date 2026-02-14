import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    if (!user_id) return NextResponse.json([])

    const res = await fetch(`${SUPA_URL}/rest/v1/saved_posts?user_id=eq.${user_id}&order=created_at.desc`, { headers: h })
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
}

export async function POST(request: Request) {
    try {
        const { user_id, post_id, collection_id } = await request.json()
        const body: any = { user_id, post_id }
        if (collection_id) body.collection_id = collection_id

        const res = await fetch(`${SUPA_URL}/rest/v1/saved_posts`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'return=representation,resolution=ignore-duplicates' },
            body: JSON.stringify(body)
        })
        const data = await res.json()
        return NextResponse.json(data[0] || { ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const post_id = searchParams.get('post_id')
    if (!user_id || !post_id) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    await fetch(`${SUPA_URL}/rest/v1/saved_posts?user_id=eq.${user_id}&post_id=eq.${post_id}`, {
        method: 'DELETE', headers: h
    })
    return NextResponse.json({ ok: true })
}
