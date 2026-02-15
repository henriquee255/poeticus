import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const headers = {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
}

function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) return forwarded.split(',')[0].trim()
    return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: Request) {
    try {
        const { slug, type } = await request.json()
        if (!slug || !type) return NextResponse.json({ ok: false })

        const ip = getClientIp(request)

        await fetch(`${SUPA_URL}/rest/v1/page_views`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ slug, type, ip })
        })

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ ok: false })
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dateFrom = searchParams.get('from')
        const dateTo = searchParams.get('to')

        const dateFilter = dateFrom
            ? `&viewed_at=gte.${new Date(dateFrom).toISOString()}${dateTo ? `&viewed_at=lte.${new Date(dateTo + 'T23:59:59').toISOString()}` : ''}`
            : ''

        // Total views
        const totalRes = await fetch(`${SUPA_URL}/rest/v1/page_views?select=id${dateFilter}`, {
            headers: { ...headers, 'Prefer': 'count=exact' }
        })
        const totalCount = parseInt(totalRes.headers.get('content-range')?.split('/')[1] || '0')

        // Unique views (unique IPs in the period)
        const uniqueRes = await fetch(`${SUPA_URL}/rest/v1/page_views?select=ip${dateFilter}`, { headers })
        const uniqueRows: { ip: string }[] = await uniqueRes.json()
        const uniqueIps = new Set((Array.isArray(uniqueRows) ? uniqueRows : []).map(r => r.ip).filter(ip => ip && ip !== 'unknown'))
        const uniqueCount = uniqueIps.size

        // Views this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const monthlyRes = await fetch(
            `${SUPA_URL}/rest/v1/page_views?select=id&viewed_at=gte.${startOfMonth.toISOString()}`,
            { headers: { ...headers, 'Prefer': 'count=exact' } }
        )
        const monthlyCount = parseInt(monthlyRes.headers.get('content-range')?.split('/')[1] || '0')

        // Top posts
        const postRes = await fetch(`${SUPA_URL}/rest/v1/page_views?select=slug&type=eq.post${dateFilter}`, { headers })
        const postRows: { slug: string }[] = await postRes.json()

        // Top livros
        const livroRes = await fetch(`${SUPA_URL}/rest/v1/page_views?select=slug&type=eq.livro${dateFilter}`, { headers })
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
            unique: uniqueCount,
            monthly: monthlyCount,
            topPosts: countBySlug(postRows),
            topLivros: countBySlug(livroRows),
        })
    } catch {
        return NextResponse.json({ total: 0, unique: 0, monthly: 0, topPosts: [], topLivros: [] })
    }
}
