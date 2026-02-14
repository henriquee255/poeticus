import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const headers = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function POST(request: Request) {
    const { action, email, password, username } = await request.json()

    if (action === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        // Create profile
        if (data.user) {
            await fetch(`${SUPA_URL}/rest/v1/profiles`, {
                method: 'POST',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ id: data.user.id, username: username || email.split('@')[0] })
            })
        }
        return NextResponse.json({ user: data.user })
    }

    if (action === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ user: data.user, session: data.session })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
