import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const res = await fetch(`${SUPA_URL}/rest/v1/escritas_livres?id=eq.${id}&select=*,profiles(username,avatar_url)`, { headers: h })
        const data = await res.json()
        const item = Array.isArray(data) ? data[0] : null
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Unique view per IP (requires escritas_views table — gracefully falls back to always counting)
        const forwarded = request.headers.get('x-forwarded-for')
        const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
        const ipHash = Buffer.from(ip).toString('base64').replace(/=/g, '')

        let shouldCount = true
        try {
            const viewCheck = await fetch(
                `${SUPA_URL}/rest/v1/escritas_views?escrita_id=eq.${id}&ip_hash=eq.${ipHash}&select=escrita_id`,
                { headers: h }
            )
            const existing = await viewCheck.json()
            if (Array.isArray(existing) && existing.length > 0) {
                shouldCount = false // already visited
            } else if (Array.isArray(existing)) {
                // Register this visit
                await fetch(`${SUPA_URL}/rest/v1/escritas_views`, {
                    method: 'POST',
                    headers: { ...h, 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ escrita_id: id, ip_hash: ipHash })
                })
            }
        } catch {
            // Table doesn't exist yet — count anyway
        }

        if (shouldCount) {
            await fetch(`${SUPA_URL}/rest/v1/escritas_livres?id=eq.${id}`, {
                method: 'PATCH',
                headers: { ...h, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ views: (item.views || 0) + 1 })
            })
            item.views = (item.views || 0) + 1
        }

        return NextResponse.json(item)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const body = await request.json()
        const { action, user_id, status, pinned, likes } = body

        if (action === 'like' && user_id) {
            // Toggle like
            const existing = await fetch(`${SUPA_URL}/rest/v1/escritas_likes?escrita_id=eq.${id}&user_id=eq.${user_id}`, { headers: h })
            const rows = await existing.json()
            const escRes = await fetch(`${SUPA_URL}/rest/v1/escritas_livres?id=eq.${id}&select=likes`, { headers: h })
            const [esc] = await escRes.json()
            const currentLikes = esc?.likes || 0

            if (Array.isArray(rows) && rows.length > 0) {
                // Unlike
                await fetch(`${SUPA_URL}/rest/v1/escritas_likes?escrita_id=eq.${id}&user_id=eq.${user_id}`, { method: 'DELETE', headers: h })
                await fetch(`${SUPA_URL}/rest/v1/escritas_livres?id=eq.${id}`, {
                    method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ likes: Math.max(0, currentLikes - 1) })
                })
                return NextResponse.json({ liked: false, likes: Math.max(0, currentLikes - 1) })
            } else {
                // Like
                await fetch(`${SUPA_URL}/rest/v1/escritas_likes`, {
                    method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ escrita_id: id, user_id })
                })
                await fetch(`${SUPA_URL}/rest/v1/escritas_livres?id=eq.${id}`, {
                    method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ likes: currentLikes + 1 })
                })
                return NextResponse.json({ liked: true, likes: currentLikes + 1 })
            }
        }

        // Admin/user update
        const { title, content, category } = body
        const update: any = {}
        if (status !== undefined) update.status = status
        if (pinned !== undefined) update.pinned = pinned
        if (likes !== undefined) update.likes = likes
        if (title !== undefined) update.title = title
        if (content !== undefined) update.content = content
        if (category !== undefined) update.category = category

        if (Object.keys(update).length > 0) {
            await fetch(`${SUPA_URL}/rest/v1/escritas_livres?id=eq.${id}`, {
                method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' },
                body: JSON.stringify(update)
            })
        }

        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await fetch(`${SUPA_URL}/rest/v1/escritas_livres?id=eq.${id}`, { method: 'DELETE', headers: h })
    return NextResponse.json({ ok: true })
}
