import { NextResponse } from 'next/server'
import { filterProfanity } from '@/lib/profanity'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')
    const admin = searchParams.get('admin')

    if (!post_id && !admin) return NextResponse.json([])

    const filter = post_id ? `post_id=eq.${post_id}&` : ''
    const res = await fetch(
        `${SUPA_URL}/rest/v1/comments?${filter}order=created_at.desc&select=*,profiles(username,avatar_url)`,
        { headers: h }
    )
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
}

export async function PATCH(request: Request) {
    try {
        const { id, likes } = await request.json()
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        await fetch(`${SUPA_URL}/rest/v1/comments?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ likes })
        })
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { post_id, user_id, content } = await request.json()
        if (!post_id || !user_id || !content?.trim()) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
        }

        const filtered = filterProfanity(content.trim())

        const res = await fetch(`${SUPA_URL}/rest/v1/comments`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'return=representation' },
            body: JSON.stringify({ post_id, user_id, content: filtered })
        })
        const data = await res.json()
        return NextResponse.json(data[0] || {})
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const user_id = searchParams.get('user_id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Admin delete (user_id=admin) ou delete pelo próprio usuário
    const filter = (!user_id || user_id === 'admin')
        ? `id=eq.${id}`
        : `id=eq.${id}&user_id=eq.${user_id}`
    await fetch(`${SUPA_URL}/rest/v1/comments?${filter}`, {
        method: 'DELETE', headers: h
    })
    return NextResponse.json({ ok: true })
}
