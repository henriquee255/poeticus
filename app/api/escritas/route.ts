import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const sort = searchParams.get('sort') || 'recent'
        const category = searchParams.get('category')
        const admin = searchParams.get('admin')
        const user_id = searchParams.get('user_id')
        const statusParam = searchParams.get('status')
        const status = statusParam !== null && statusParam !== ''
            ? statusParam
            : (admin || user_id) ? undefined : 'published'

        let q = supabase.from('escritas_livres').select('*,profiles(username,avatar_url)')

        if (status) q = q.eq('status', status)
        if (category) q = q.eq('category', category)
        if (user_id) q = q.eq('user_id', user_id)

        if (sort === 'likes') q = q.order('likes', { ascending: false }).order('created_at', { ascending: false })
        else if (sort === 'views') q = q.order('views', { ascending: false }).order('created_at', { ascending: false })
        else q = q.order('pinned', { ascending: false }).order('created_at', { ascending: false })

        const { data, error } = await q
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data || [])
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

        const { data, error } = await supabase.from('escritas_livres').insert(body).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        if (!data?.id) return NextResponse.json({ error: 'Erro ao publicar' }, { status: 400 })
        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
