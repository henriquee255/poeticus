import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const res = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&select=*,profiles(id,username,avatar_url,bio)&order=role.asc`,
        { headers: h }
    )
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
}

// PATCH: change member role (admin_id must be creator or moderator with enough privilege)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { admin_id, target_user_id, role } = await request.json()
    if (!admin_id || !target_user_id || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Check admin's role
    const adminCheck = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${admin_id}&select=role`,
        { headers: h }
    )
    const [adminMember] = await adminCheck.json()
    if (!adminMember || adminMember.role === 'member') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    // Only creator can promote/demote moderators
    if ((role === 'moderator' || role === 'member') && adminMember.role !== 'creator') {
        // moderators can only demote members (not other moderators)
        const targetCheck = await fetch(
            `${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${target_user_id}&select=role`,
            { headers: h }
        )
        const [targetMember] = await targetCheck.json()
        if (targetMember?.role === 'moderator' || targetMember?.role === 'creator') {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
    }

    await fetch(`${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${target_user_id}`, {
        method: 'PATCH',
        headers: { ...h, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ role })
    })
    return NextResponse.json({ ok: true, role })
}

// DELETE: remove member
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const admin_id = searchParams.get('admin_id')
    const target_user_id = searchParams.get('target_user_id')
    if (!admin_id || !target_user_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Check admin's role
    const adminCheck = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${admin_id}&select=role`,
        { headers: h }
    )
    const [adminMember] = await adminCheck.json()
    if (!adminMember || adminMember.role === 'member') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const targetCheck = await fetch(
        `${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${target_user_id}&select=role`,
        { headers: h }
    )
    const [targetMember] = await targetCheck.json()
    // Moderator cannot remove another moderator or creator
    if (adminMember.role === 'moderator' && (targetMember?.role === 'moderator' || targetMember?.role === 'creator')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await fetch(`${SUPA_URL}/rest/v1/feed_group_members?group_id=eq.${id}&user_id=eq.${target_user_id}`, {
        method: 'DELETE', headers: h
    })
    // Decrement member_count
    const countRes = await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}&select=member_count`, { headers: h })
    const [grp] = await countRes.json()
    await fetch(`${SUPA_URL}/rest/v1/feed_groups?id=eq.${id}`, {
        method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ member_count: Math.max(0, (grp?.member_count || 1) - 1) })
    })
    return NextResponse.json({ ok: true })
}
