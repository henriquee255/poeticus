import { NextResponse } from 'next/server'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const headers = {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
}

export async function POST(request: Request) {
    try {
        const { slug, type } = await request.json()
        if (!slug || !type) return NextResponse.json({ ok: false })

        await fetch(`${URL}/rest/v1/page_views`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ slug, type })
        })

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ ok: false })
    }
}

export async function GET() {
    try {
        // Total views
        const totalRes = await fetch(`${URL}/rest/v1/page_views?select=id`, {
            headers: { ...headers, 'Prefer': 'count=exact' }
        })
        const totalCount = parseInt(totalRes.headers.get('content-range')?.split('/')[1] || '0')

        // Views this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const monthlyRes = await fetch(
            `${URL}/rest/v1/page_views?select=id&viewed_at=gte.${startOfMonth.toISOString()}`,
            { headers: { ...headers, 'Prefer': 'count=exact' } }
        )
        const monthlyCount = parseInt(monthlyRes.headers.get('content-range')?.split('/')[1] || '0')

        // Top posts
        const postRes = await fetch(`${URL}/rest/v1/page_views?select=slug&type=eq.post`, { headers })
        const postRows: { slug: string }[] = await postRes.json()

        // Top livros
        const livroRes = await fetch(`${URL}/rest/v1/page_views?select=slug&type=eq.livro`, { headers })
        const livroRows: { slug: string }[] = await livroRes.json()

        const countBySlug = (rows: { slug: string }[]) => {
            const map: Record<string, number> = {}
            for (const r of (rows || [])) map[r.slug] = (map[r.slug] || 0) + 1
            return Object.entries(map)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([slug, views]) => ({ slug, views }))
        }

        return NextResponse.json({
            total: totalCount,
            monthly: monthlyCount,
            topPosts: countBySlug(postRows),
            topLivros: countBySlug(livroRows),
        })
    } catch {
        return NextResponse.json({ total: 0, monthly: 0, topPosts: [], topLivros: [] })
    }
}
