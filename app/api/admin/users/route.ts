import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error) throw error

        // Get profiles
        const profilesRes = await fetch(`${SUPA_URL}/rest/v1/profiles?select=*`, { headers: h })
        const profiles = await profilesRes.json()
        const profileMap: Record<string, any> = {}
        for (const p of (Array.isArray(profiles) ? profiles : [])) profileMap[p.id] = p

        const users = data.users.map(u => ({
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
            // Create user
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            })
            if (error) throw error

            // Create profile
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
            // Send invite email via Supabase
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
