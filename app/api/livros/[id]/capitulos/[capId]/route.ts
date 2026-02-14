import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: Promise<{ capId: string }> }) {
    try {
        const { capId } = await params
        const body = await request.json()
        const { data, error } = await supabase
            .from('chapters')
            .update(body)
            .eq('id', capId)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ capId: string }> }) {
    try {
        const { capId } = await params
        const { error } = await supabase
            .from('chapters')
            .delete()
            .eq('id', capId)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
