import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function PATCH(request: Request) {
    try {
        const { user_id, username, avatar_url, email, is_blocked } = await request.json()
        if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

        const body: any = {}
        if (username !== undefined) body.username = username
        if (avatar_url !== undefined) body.avatar_url = avatar_url
        if (email !== undefined) body.email = email
        if (is_blocked !== undefined) body.is_blocked = is_blocked

        // Upsert: cria se não existir, atualiza se existir
        const upsertBody = { id: user_id, ...body }
        const res = await fetch(`${SUPA_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=representation' },
            body: JSON.stringify(upsertBody)
        })
        const data = await res.json()
        return NextResponse.json(data[0] || {})
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
