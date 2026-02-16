import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

// PATCH: toggle membership
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { user_id } = await request.json()
    if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

    const check = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${user_id}&select=group_id`,
        { headers: h }
    )
    const existing = await check.json()
    const isMember = Array.isArray(existing) && existing.length > 0

    const countRes = await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}&select=member_count`, { headers: h })
    const [group] = await countRes.json()
    const current = group?.member_count || 0

    if (isMember) {
        await fetch(`${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${user_id}`, {
            method: 'DELETE', headers: h
        })
        await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}`, {
            method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ member_count: Math.max(0, current - 1) })
        })
        return NextResponse.json({ member: false, member_count: Math.max(0, current - 1) })
    } else {
        await fetch(`${SUPA_URL}/rest/v1/feed_group_members`, {
            method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ group_id: id, user_id })
        })
        await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}`, {
            method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ member_count: current + 1 })
        })
        return NextResponse.json({ member: true, member_count: current + 1 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}`, { method: 'DELETE', headers: h })
    return NextResponse.json({ ok: true })
}
