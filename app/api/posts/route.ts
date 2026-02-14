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
        const { id, action } = await request.json()

        if (action === 'like') {
            const { data, error } = await supabase.rpc('increment_likes', { post_id: id })

            // If RPC is not available, we can fallback to a manual update
            if (error) {
                const { data: currentPost } = await supabase
                    .from('posts')
                    .select('likes')
                    .eq('id', id)
                    .single()

                const { data: updated, error: updateError } = await supabase
                    .from('posts')
                    .update({ likes: (currentPost?.likes || 0) + 1 })
                    .eq('id', id)
                    .select()
                    .single()

                if (updateError) throw updateError
                return NextResponse.json(updated)
            }

            return NextResponse.json(data)
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
