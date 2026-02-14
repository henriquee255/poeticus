import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at')
        if (error) return NextResponse.json([])
        return NextResponse.json(data)
    } catch {
        return NextResponse.json([])
    }
}

export async function POST(request: Request) {
    try {
        const notes = await request.json()

        // Delete all and re-insert (simple upsert strategy)
        await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        if (notes.length === 0) return NextResponse.json([])

        const toInsert = notes.map((n: any) => ({
            text: n.text,
            type: n.type || 'info',
            active: n.active || false,
            link: n.link || null,
        }))

        const { data, error } = await supabase.from('notifications').insert(toInsert).select()
        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
