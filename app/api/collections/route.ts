import { NextResponse } from 'next/server'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    if (!user_id) return NextResponse.json([])

    const res = await fetch(`${URL}/rest/v1/collections?user_id=eq.${user_id}&order=created_at.asc`, { headers: h })
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
}

export async function POST(request: Request) {
    const { user_id, name } = await request.json()
    const res = await fetch(`${URL}/rest/v1/collections`, {
        method: 'POST',
        headers: { ...h, 'Prefer': 'return=representation' },
        body: JSON.stringify({ user_id, name })
    })
    const data = await res.json()
    return NextResponse.json(data[0] || {})
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const user_id = searchParams.get('user_id')
    if (!id || !user_id) return NextResponse.json({ error: 'Missing' }, { status: 400 })

    await fetch(`${URL}/rest/v1/collections?id=eq.${id}&user_id=eq.${user_id}`, {
        method: 'DELETE', headers: h
    })
    return NextResponse.json({ ok: true })
}
