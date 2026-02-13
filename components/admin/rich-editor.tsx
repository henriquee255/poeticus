"use client"

import { useState } from "react"
import { Bold, Italic, List, Quote, Image, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RichEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
    // Simulação de editor rico. Em produção real, usariamos TipTap ou Slate.js
    // Aqui vamos usar um textarea com botões que inserem tags HTML básicas ou Markdown

    const handleFormat = (tag: string) => {
        // Lógica simplificada de inserção
        const textarea = document.getElementById("post-content") as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const before = text.substring(0, start)
        const selection = text.substring(start, end)
        const after = text.substring(end)

        let newText = ""
        switch (tag) {
            case 'b': newText = `${before}<strong>${selection}</strong>${after}`; break
            case 'i': newText = `${before}<em>${selection}</em>${after}`; break
            case 'quote': newText = `${before}<blockquote>${selection}</blockquote>${after}`; break
            case 'list': newText = `${before}<ul>\n  <li>${selection}</li>\n</ul>${after}`; break
            default: newText = text;
        }

        onChange(newText)
    }

    return (
        <div className="border border-white/10 rounded-lg bg-black/50 overflow-hidden group focus-within:border-purple-500/50 transition-colors">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-white/5">
                <Button onClick={() => handleFormat('b')} type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white">
                    <Bold className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleFormat('i')} type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white">
                    <Italic className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <Button onClick={() => handleFormat('quote')} type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white">
                    <Quote className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleFormat('list')} type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white">
                    <List className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white">
                    <Image className="w-4 h-4" />
                </Button>
            </div>

            {/* Editor Area */}
            <textarea
                id="post-content"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-[400px] bg-transparent p-4 text-gray-300 focus:outline-none resize-none font-serif leading-relaxed"
            />

            <div className="px-4 py-2 text-xs text-gray-600 border-t border-white/5 flex justify-between">
                <span>HTML Habilitado</span>
                <span>{value.length} caracteres</span>
            </div>
        </div>
    )
}
