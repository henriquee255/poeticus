import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const { user_id } = await request.json()
        if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

        // Toggle like
        const existing = await fetch(`${SUPA_URL}/rest/v1/feed_likes?post_id=eq.${id}&user_id=eq.${user_id}`, { headers: h })
        const rows = await existing.json()
        const postRes = await fetch(`${SUPA_URL}/rest/v1/feed_posts?id=eq.${id}&select=likes`, { headers: h })
        const [post] = await postRes.json()
        const currentLikes = post?.likes || 0

        if (Array.isArray(rows) && rows.length > 0) {
            await fetch(`${SUPA_URL}/rest/v1/feed_likes?post_id=eq.${id}&user_id=eq.${user_id}`, { method: 'DELETE', headers: h })
            await fetch(`${SUPA_URL}/rest/v1/feed_posts?id=eq.${id}`, {
                method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ likes: Math.max(0, currentLikes - 1) })
            })
            return NextResponse.json({ liked: false, likes: Math.max(0, currentLikes - 1) })
        } else {
            await fetch(`${SUPA_URL}/rest/v1/feed_likes`, {
                method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ post_id: id, user_id })
            })
            await fetch(`${SUPA_URL}/rest/v1/feed_posts?id=eq.${id}`, {
                method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ likes: currentLikes + 1 })
            })
            return NextResponse.json({ liked: true, likes: currentLikes + 1 })
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await fetch(`${SUPA_URL}/rest/v1/feed_posts?id=eq.${id}`, { method: 'DELETE', headers: h })
    return NextResponse.json({ ok: true })
}
