import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const KEY = SERVICE_KEY || ANON_KEY
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const AUTH_URL = `${SUPA_URL}/auth/v1/admin`

export async function GET() {
    try {
        const usersRes = await fetch(`${AUTH_URL}/users?per_page=1000`, { headers: h })
        const usersData = await usersRes.json()
        if (!usersRes.ok) throw new Error(usersData.message || 'Failed to list users')

        const userList = usersData.users || []

        const profilesRes = await fetch(`${SUPA_URL}/rest/v1/profiles?select=*`, { headers: h })
        const profiles = await profilesRes.json()
        const profileMap: Record<string, any> = {}
        for (const p of (Array.isArray(profiles) ? profiles : [])) profileMap[p.id] = p

        const users = userList.map((u: any) => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            username: profileMap[u.id]?.username || '',
            avatar_url: profileMap[u.id]?.avatar_url || '',
        }))

        return NextResponse.json(users)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { action, email, password, username } = await request.json()

        if (action === 'create') {
            const res = await fetch(`${AUTH_URL}/users`, {
                method: 'POST',
                headers: h,
                body: JSON.stringify({ email, password, email_confirm: true })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to create user')

            if (data.id) {
                await fetch(`${SUPA_URL}/rest/v1/profiles`, {
                    method: 'POST',
                    headers: { ...h, 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ id: data.id, username: username || email.split('@')[0] })
                })
            }
            return NextResponse.json({ user: data })
        }

        if (action === 'invite') {
            const res = await fetch(`${AUTH_URL}/users`, {
                method: 'POST',
                headers: h,
                body: JSON.stringify({ email, email_confirm: false })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to invite user')
            return NextResponse.json({ ok: true, user: data })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const { user_id, email, password, username } = await request.json()
        if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

        const updates: any = {}
        if (email) updates.email = email
        if (password) updates.password = password

        if (Object.keys(updates).length > 0) {
            const res = await fetch(`${AUTH_URL}/users/${user_id}`, {
                method: 'PUT',
                headers: h,
                body: JSON.stringify(updates)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to update user')
        }

        if (username) {
            await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${user_id}`, {
                method: 'PATCH',
                headers: { ...h, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ username })
            })
        }

        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const user_id = searchParams.get('user_id')
        if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

        const res = await fetch(`${AUTH_URL}/users/${user_id}`, { method: 'DELETE', headers: h })
        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.message || 'Failed to delete user')
        }

        await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${user_id}`, { method: 'DELETE', headers: h })
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
