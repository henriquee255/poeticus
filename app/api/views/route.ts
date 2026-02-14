import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const { slug, type } = await request.json()
        if (!slug || !type) return NextResponse.json({ error: 'Missing slug or type' }, { status: 400 })

        await supabase.from('page_views').insert({ slug, type })
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ ok: false })
    }
}

export async function GET() {
    try {
        // Total views
        const { count: total } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })

        // Views this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: monthly } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('viewed_at', startOfMonth.toISOString())

        // Top viewed posts
        const { data: postViews } = await supabase
            .from('page_views')
            .select('slug')
            .eq('type', 'post')

        // Top viewed livros
        const { data: livroViews } = await supabase
            .from('page_views')
            .select('slug')
            .eq('type', 'livro')

        const countBySlug = (rows: { slug: string }[] | null) => {
            const map: Record<string, number> = {}
            for (const r of rows || []) {
                map[r.slug] = (map[r.slug] || 0) + 1
            }
            return Object.entries(map)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([slug, views]) => ({ slug, views }))
        }

        return NextResponse.json({
            total: total || 0,
            monthly: monthly || 0,
            topPosts: countBySlug(postViews),
            topLivros: countBySlug(livroViews),
        })
    } catch {
        return NextResponse.json({ total: 0, monthly: 0, topPosts: [], topLivros: [] })
    }
}
