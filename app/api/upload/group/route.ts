import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function ensureBucket() {
    await fetch(`${SUPA_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'groups', name: 'groups', public: true }),
    })
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const group_id = formData.get('group_id') as string
        const type = (formData.get('type') as string) || 'image' // 'image' | 'cover'

        if (!file || !group_id) {
            return NextResponse.json({ error: 'Missing file or group_id' }, { status: 400 })
        }

        await ensureBucket()

        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `${type}_${group_id}.${ext}`
        const buffer = Buffer.from(await file.arrayBuffer())

        const res = await fetch(`${SUPA_URL}/storage/v1/object/groups/${filename}`, {
            method: 'POST',
            headers: {
                'apikey': KEY,
                'Authorization': `Bearer ${KEY}`,
                'Content-Type': file.type || 'image/jpeg',
                'x-upsert': 'true',
            },
            body: buffer,
        })

        if (!res.ok) {
            const err = await res.text()
            return NextResponse.json({ error: err }, { status: 500 })
        }

        const publicUrl = `${SUPA_URL}/storage/v1/object/public/groups/${filename}`
        return NextResponse.json({ url: publicUrl })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
