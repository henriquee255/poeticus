import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function PATCH(request: Request) {
    try {
        const { user_id, username, avatar_url } = await request.json()
        if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

        const body: any = {}
        if (username !== undefined) body.username = username
        if (avatar_url !== undefined) body.avatar_url = avatar_url

        const res = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${user_id}`, {
            method: 'PATCH',
            headers: { ...h, 'Prefer': 'return=representation' },
            body: JSON.stringify(body)
        })
        const data = await res.json()
        return NextResponse.json(data[0] || {})
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
