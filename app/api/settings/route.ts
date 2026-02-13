import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')

        if (error) throw error

        // Convert array of {key, value} to a single object
        const settings = data.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value
            return acc
        }, {})

        return NextResponse.json(settings)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Upsert all settings
        const entries = Object.entries(body).map(([key, value]) => ({ key, value }))
        const { data, error } = await supabase
            .from('settings')
            .upsert(entries)
            .select()

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
