import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const sort = searchParams.get('sort') || 'recent'
        const category = searchParams.get('category')
        const admin = searchParams.get('admin')
        const user_id = searchParams.get('user_id')
        const statusParam = searchParams.get('status')
        // If user_id or admin: show all statuses unless status explicitly set
        const status = statusParam !== null && statusParam !== ''
            ? statusParam
            : (admin || user_id) ? undefined : 'published'

        let query = `${SUPA_URL}/rest/v1/escritas_livres?select=*,profiles(username,avatar_url)`

        if (status) query += `&status=eq.${status}`
        if (category) query += `&category=eq.${category}`
        if (user_id) query += `&user_id=eq.${user_id}`

        if (sort === 'likes') query += '&order=likes.desc,created_at.desc'
        else if (sort === 'views') query += '&order=views.desc,created_at.desc'
        else query += '&order=pinned.desc,created_at.desc'

        const res = await fetch(query, { headers: h })
        const data = await res.json()
        return NextResponse.json(Array.isArray(data) ? data : [])
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { user_id, title, content, category, image_url } = await request.json()
        if (!user_id || !title || !content) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
        }

        const body: any = { user_id, title, content, category: category || 'geral', status: 'published' }
        if (image_url) body.image_url = image_url

        const res = await fetch(`${SUPA_URL}/rest/v1/escritas_livres`, {
            method: 'POST',
            headers: { ...h, 'Prefer': 'return=representation' },
            body: JSON.stringify(body)
        })
        const data = await res.json()
        return NextResponse.json(data[0] || {})
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
