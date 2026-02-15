import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const user_id = searchParams.get('user_id')

        let query = `${SUPA_URL}/rest/v1/feedback?order=created_at.desc`
        if (type) query += `&type=eq.${type}`
        if (status) query += `&status=eq.${status}`
        if (user_id) query += `&user_id=eq.${user_id}`

        const res = await fetch(query, { headers: h })
        const data = await res.json()
        return NextResponse.json(Array.isArray(data) ? data : [])
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { user_id, username, email, type, title, content } = await request.json()
        if (!title || !content) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })

        const res = await fetch(`${SUPA_URL}/rest/v1/feedback`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'return=representation' },
            body: JSON.stringify({ user_id, username, email, type: type || 'suggestion', title, content })
        })
        const data = await res.json()
        return NextResponse.json(data[0] || {})
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json()
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        await fetch(`${SUPA_URL}/rest/v1/feedback?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status })
        })
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await fetch(`${SUPA_URL}/rest/v1/feedback?id=eq.${id}`, { method: 'DELETE', headers: h })
    return NextResponse.json({ ok: true })
}
