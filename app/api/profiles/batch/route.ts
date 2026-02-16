import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')
    if (!ids) return NextResponse.json([])
    const idList = ids.split(',').filter(Boolean).slice(0, 50)
    if (idList.length === 0) return NextResponse.json([])

    const res = await fetch(
        `${SUPA_URL}/rest/v1/profiles?id=in.(${idList.join(',')})&select=id,username,avatar_url`,
        { headers: h }
    )
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
}
