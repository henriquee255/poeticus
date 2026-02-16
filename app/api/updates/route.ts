import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET() {
    try {
        const res = await fetch(
            `${SUPA_URL}/rest/v1/site_updates?order=created_at.desc&limit=20`,
            { headers: h }
        )
        const data = await res.json()
        return NextResponse.json(Array.isArray(data) ? data : [])
    } catch {
        return NextResponse.json([])
    }
}

export async function POST(request: Request) {
    try {
        const { title, content, type } = await request.json()
        if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        const res = await fetch(`${SUPA_URL}/rest/v1/site_updates`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'return=representation' },
            body: JSON.stringify({ title: title.trim(), content: content.trim(), type: type || 'update' })
        })
        const data = await res.json()
        return NextResponse.json(Array.isArray(data) ? data[0] : data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        await fetch(`${SUPA_URL}/rest/v1/site_updates?id=eq.${id}`, { method: 'DELETE', headers: h })
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
