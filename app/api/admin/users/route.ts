import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

// Cliente para operações de auth (signUp)
const supabase = createClient(SUPA_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET() {
    try {
        // Lista usuários via tabela profiles (funciona com qualquer chave)
        const res = await fetch(
            `${SUPA_URL}/rest/v1/profiles?select=id,username,email,avatar_url,created_at,is_blocked&order=created_at.desc`,
            { headers: h }
        )
        const profiles = await res.json()
        if (!Array.isArray(profiles)) throw new Error(JSON.stringify(profiles))

        const users = profiles.map((p: any) => ({
            id: p.id,
            email: p.email || '',
            username: p.username || '',
            avatar_url: p.avatar_url || '',
            created_at: p.created_at,
            last_sign_in_at: null,
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
            // Cria usuário via signUp normal
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) throw error

            if (data.user) {
                // Upsert profile
                await fetch(`${SUPA_URL}/rest/v1/profiles`, {
                    method: 'POST',
                    headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
                    body: JSON.stringify({ id: data.user.id, username: username || email.split('@')[0] })
                })
            }
            return NextResponse.json({ user: data.user })
        }

        if (action === 'invite') {
            // Cria conta sem senha (usuário define depois)
            const tempPass = Math.random().toString(36).slice(-10) + 'A1!'
            const { data, error } = await supabase.auth.signUp({ email, password: tempPass })
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
        const { user_id, username, email, is_blocked } = await request.json()
        if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

        const profileUpdate: any = {}
        if (username !== undefined) profileUpdate.username = username
        if (email !== undefined) profileUpdate.email = email
        if (is_blocked !== undefined) profileUpdate.is_blocked = is_blocked

        if (Object.keys(profileUpdate).length > 0) {
            await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${user_id}`, {
                method: 'PATCH',
                headers: { ...h, 'Prefer': 'return=minimal' },
                body: JSON.stringify(profileUpdate)
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

        // Bloqueia o usuário (marca is_blocked=true) em vez de deletar
        // Isso força logout automático quando ele tentar acessar
        await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${user_id}`, {
            method: 'PATCH',
            headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ is_blocked: true })
        })
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
