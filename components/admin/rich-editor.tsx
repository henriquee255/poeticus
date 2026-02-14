"use client"

import { useState } from "react"
import { Bold, Italic, Quote, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RichEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

const FONTS = [
    { label: 'Serif', value: 'Georgia, serif' },
    { label: 'Sans', value: 'system-ui, sans-serif' },
    { label: 'Mono', value: 'monospace' },
    { label: 'Cursiva', value: 'cursive' },
]

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
    const [align, setAlign] = useState<'left' | 'center' | 'right'>('left')
    const [font, setFont] = useState(FONTS[0].value)

    const wrapSelection = (open: string, close: string) => {
        const ta = document.getElementById("post-content") as HTMLTextAreaElement
        if (!ta) return
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const text = ta.value
        onChange(text.substring(0, start) + open + text.substring(start, end) + close + text.substring(end))
    }

    const handleAlign = (a: 'left' | 'center' | 'right') => {
        setAlign(a)
        const stripped = value.replace(/^<div style="text-align:[^"]*">/, '').replace(/<\/div>$/, '')
        onChange(a === 'left' ? stripped : `<div style="text-align:${a}">${stripped}</div>`)
    }

    return (
        <div className="border border-white/10 rounded-lg bg-black/50 overflow-hidden focus-within:border-purple-500/50 transition-colors">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-white/5">
                <Button onClick={() => wrapSelection('<strong>', '</strong>')} type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white">
                    <Bold className="w-4 h-4" />
                </Button>
                <Button onClick={() => wrapSelection('<em>', '</em>')} type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white">
                    <Italic className="w-4 h-4" />
                </Button>
                <Button onClick={() => wrapSelection('<blockquote>', '</blockquote>')} type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white">
                    <Quote className="w-4 h-4" />
                </Button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <Button onClick={() => handleAlign('left')} type="button" variant="ghost" size="icon" className={cn("h-8 w-8 hover:bg-white/10 hover:text-white", align === 'left' ? 'text-purple-400' : 'text-gray-400')}>
                    <AlignLeft className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleAlign('center')} type="button" variant="ghost" size="icon" className={cn("h-8 w-8 hover:bg-white/10 hover:text-white", align === 'center' ? 'text-purple-400' : 'text-gray-400')}>
                    <AlignCenter className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleAlign('right')} type="button" variant="ghost" size="icon" className={cn("h-8 w-8 hover:bg-white/10 hover:text-white", align === 'right' ? 'text-purple-400' : 'text-gray-400')}>
                    <AlignRight className="w-4 h-4" />
                </Button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <select
                    value={font}
                    onChange={e => setFont(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
                >
                    {FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
            </div>

            {/* Editor Area */}
            <textarea
                id="post-content"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-[400px] bg-transparent p-4 text-gray-300 focus:outline-none resize-none leading-relaxed"
                style={{ fontFamily: font, textAlign: align }}
            />

            <div className="px-4 py-2 text-xs text-gray-600 border-t border-white/5 flex justify-between">
                <span>Enter = nova linha (verso)</span>
                <span>{value.length} caracteres</span>
            </div>
        </div>
    )
}
