import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { data, error } = await supabase
            .from('posts')
            .insert([body])
            .select()

        if (error) throw error
        return NextResponse.json(data[0])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id, action } = body

        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        if (action === 'like' || action === 'share') {
            const field = action === 'like' ? 'likes' : 'shares'

            // Fetch current value
            const { data: current, error: fetchError } = await supabase
                .from('posts')
                .select(field)
                .eq('id', id)
                .single()

            if (fetchError) {
                console.error('Fetch error:', fetchError)
                return NextResponse.json({ error: fetchError.message }, { status: 500 })
            }

            const newValue = ((current as any)?.[field] || 0) + 1

            const { data: updated, error: updateError } = await supabase
                .from('posts')
                .update({ [field]: newValue })
                .eq('id', id)
                .select()
                .single()

            if (updateError) {
                console.error('Update error:', updateError)
                return NextResponse.json({ error: updateError.message }, { status: 500 })
            }

            return NextResponse.json(updated)
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('PATCH error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
