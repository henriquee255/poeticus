import { NextResponse } from 'next/server'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function ensureBucket() {
    // Cria o bucket avatars se não existir
    await fetch(`${SUPA_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
            'apikey': KEY,
            'Authorization': `Bearer ${KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 'avatars', name: 'avatars', public: true }),
    })
    // Ignora erro se já existir
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const userId = formData.get('user_id') as string

        if (!file || !userId) {
            return NextResponse.json({ error: 'Missing file or user_id' }, { status: 400 })
        }

        await ensureBucket()

        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `${userId}.${ext}`
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload via Supabase Storage REST API
        const res = await fetch(`${SUPA_URL}/storage/v1/object/avatars/${filename}`, {
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

        const publicUrl = `${SUPA_URL}/storage/v1/object/public/avatars/${filename}`
        return NextResponse.json({ url: publicUrl })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
