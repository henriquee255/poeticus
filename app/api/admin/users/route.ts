import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(SUPA_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const h = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' }

export async function GET() {
    try {
        // Tenta via SDK admin
        let userList: any[] = []
        try {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers()
            if (!error) userList = data.users
        } catch {
            // fallback: busca via REST
            const res = await fetch(`${SUPA_URL}/auth/v1/admin/users?per_page=1000`, { headers: h })
            const d = await res.json()
            userList = d.users || []
        }

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
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email, password, email_confirm: true
            })
            if (error) throw error

            if (data.user) {
                await fetch(`${SUPA_URL}/rest/v1/profiles`, {
                    method: 'POST',
                    headers: { ...h, 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ id: data.user.id, username: username || email.split('@')[0] })
                })
            }
            return NextResponse.json({ user: data.user })
        }

        if (action === 'invite') {
            const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)
            if (error) throw error
            return NextResponse.json({ ok: true, user: data.user })
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
            const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, updates)
            if (error) throw error
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

        const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id)
        if (error) throw error

        await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${user_id}`, { method: 'DELETE', headers: h })
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
