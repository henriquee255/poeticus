import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const res = await fetch(
        `${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}&select=*`,
        { headers: h }
    )
    const data = await res.json()
    const group = Array.isArray(data) && data[0]?.id ? data[0] : null
    if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(group)
}

// PATCH: toggle membership OR update group details
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()
    const { user_id, update } = body

    // --- Update group details (name, description, image_url, cover_url, is_private)
    if (update) {
        const allowed: any = {}
        if (update.name !== undefined) allowed.name = update.name
        if (update.description !== undefined) allowed.description = update.description
        if (update.image_url !== undefined) allowed.image_url = update.image_url
        if (update.cover_url !== undefined) allowed.cover_url = update.cover_url
        if (update.is_private !== undefined) allowed.is_private = update.is_private
        if (Object.keys(allowed).length > 0) {
            await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}`, {
                method: 'PATCH',
                headers: { ...h, 'Prefer': 'return=minimal' },
                body: JSON.stringify(allowed)
            })
        }
        return NextResponse.json({ ok: true })
    }

    // --- Toggle membership
    if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

    // Check if group is private
    const groupRes = await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}&select=is_private,member_count`, { headers: h })
    const [group] = await groupRes.json()
    const current = group?.member_count || 0
    const isPrivate = group?.is_private || false

    // Check membership
    const checkRes = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${user_id}&select=group_id`,
        { headers: h }
    )
    const existing = await checkRes.json()
    const isMember = Array.isArray(existing) && existing.length > 0

    if (isMember) {
        // Leave group
        await fetch(`${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${user_id}`, {
            method: 'DELETE', headers: h
        })
        await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}`, {
            method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ member_count: Math.max(0, current - 1) })
        })
        return NextResponse.json({ member: false, member_count: Math.max(0, current - 1) })
    }

    if (isPrivate) {
        // Check if already requested
        const reqCheck = await fetch(
            `${SUPA_URL}/rest/v1/feed_group_requests?group_id=eq.${id}&user_id=eq.${user_id}&select=id,status`,
            { headers: h }
        )
        const existing_req = await reqCheck.json()
        if (Array.isArray(existing_req) && existing_req.length > 0) {
            return NextResponse.json({ member: false, requested: true, status: existing_req[0].status })
        }
        // Create join request
        await fetch(`${SUPA_URL}/rest/v1/feed_group_requests`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ group_id: id, user_id, status: 'pending' })
        })
        return NextResponse.json({ member: false, requested: true, status: 'pending' })
    }

    // Join open group
    await fetch(`${SUPA_URL}/rest/v1/feed_group_members`, {
        method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ group_id: id, user_id, role: 'member' })
    })
    await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}`, {
        method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ member_count: current + 1 })
    })
    return NextResponse.json({ member: true, member_count: current + 1 })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}`, { method: 'DELETE', headers: h })
    return NextResponse.json({ ok: true })
}
