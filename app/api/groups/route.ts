import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET() {
    const res = await fetch(
        `${SUPA_URL}/rest/v1/feed_groups?order=member_count.desc&select=*,profiles(username,avatar_url)`,
        { headers: h }
    )
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
}

export async function POST(request: Request) {
    const { name, description, creator_id } = await request.json()
    if (!name?.trim() || !creator_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Create group
    const res = await fetch(`${SUPA_URL}/rest/v1/feed_groups`, {
        method: 'POST',
        headers: { ...h, 'Prefer': 'return=representation' },
        body: JSON.stringify({ name: name.trim(), description: description?.trim() || null, creator_id, member_count: 1 })
    })
    const group = await res.json()
    const g = Array.isArray(group) ? group[0] : group
    if (!g?.id) return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })

    // Auto-join creator
    await fetch(`${SUPA_URL}/rest/v1/feed_group_members`, {
        method: 'POST',
        headers: { ...h, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ group_id: g.id, user_id: creator_id })
    })

    return NextResponse.json(g)
}
