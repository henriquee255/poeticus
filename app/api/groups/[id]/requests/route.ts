import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

// GET: list pending requests (for creator/moderator)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const res = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_requests?group_id=eq.${id}&status=eq.pending&select=*,profiles(username,avatar_url)&order=created_at.asc`,
        { headers: h }
    )
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
}

// POST: send join request
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { user_id } = await request.json()
    if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

    // Check not already a member
    const memberCheck = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${user_id}&select=group_id`,
        { headers: h }
    )
    const existing = await memberCheck.json()
    if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    const res = await fetch(`${SUPA_URL}/rest/v1/feed_group_requests`, {
        method: 'POST',
        headers: { ...h, 'Prefer': 'return=representation' },
        body: JSON.stringify({ group_id: id, user_id, status: 'pending' })
    })
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data[0] : data)
}

// PATCH: approve or reject a request
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { request_id, action, admin_id } = await request.json()
    if (!request_id || !action || !admin_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Verify admin is creator or moderator
    const adminCheck = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${admin_id}&select=role`,
        { headers: h }
    )
    const [adminMember] = await adminCheck.json()
    if (!adminMember || adminMember.role === 'member') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the request
    const reqRes = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_requests?id=eq.${request_id}&select=*`,
        { headers: h }
    )
    const [req] = await reqRes.json()
    if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    if (action === 'approve') {
        // Add member
        await fetch(`${SUPA_URL}/rest/v1/feed_group_members`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ group_id: id, user_id: req.user_id, role: 'member' })
        })
        // Increment member_count
        const countRes = await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}&select=member_count`, { headers: h })
        const [grp] = await countRes.json()
        await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}`, {
            method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ member_count: (grp?.member_count || 0) + 1 })
        })
    }

    // Update request status
    await fetch(`${SUPA_URL}/rest/v1/feed_group_requests?id=eq.${request_id}`, {
        method: 'PATCH',
        headers: { ...h, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' })
    })

    return NextResponse.json({ ok: true, action })
}
