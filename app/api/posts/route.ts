import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { data, error } = await supabase
            .from('posts')
            .insert([body])
            .select()

        if (error) throw error
        return NextResponse.json(data[0])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id, action } = body

        if (!id || (action !== 'like' && action !== 'share')) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        const field = action === 'like' ? 'likes' : 'shares'

        // 1. Get current value via REST
        const getRes = await fetch(
            `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}&select=${field}`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                }
            }
        )

        const rows = await getRes.json()
        const current = rows?.[0]?.[field] || 0

        // 2. Update via REST
        const updateRes = await fetch(
            `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation',
                },
                body: JSON.stringify({ [field]: current + 1 })
            }
        )

        const updated = await updateRes.json()

        if (!updateRes.ok) {
            return NextResponse.json({ error: JSON.stringify(updated) }, { status: 500 })
        }

        return NextResponse.json(updated[0] || { [field]: current + 1 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
