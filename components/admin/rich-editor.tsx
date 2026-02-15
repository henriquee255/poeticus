"use client"

import { useState, useRef, useEffect } from "react"
import {
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Quote, List, ListOrdered, Minus, Smile, Type, Palette, ChevronDown, Heading1, Heading2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

const FONTS = [
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Garamond', value: 'Garamond, serif' },
    { label: 'Palatino', value: '"Palatino Linotype", serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Trebuchet', value: '"Trebuchet MS", sans-serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
    { label: 'Consolas', value: 'Consolas, monospace' },
    { label: 'Cursiva', value: 'cursive' },
    { label: 'Fantasy', value: 'fantasy' },
]

const FONT_SIZES = ['10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64', '72']

const TEXT_COLORS = [
    '#ffffff', '#e2e8f0', '#94a3b8', '#64748b',
    '#f87171', '#fb923c', '#fbbf24', '#a3e635',
    '#34d399', '#22d3ee', '#60a5fa', '#a78bfa',
    '#f472b6', '#e879f9', '#000000', '#1e293b',
]

const EMOJIS = [
    '😊','😂','❤️','🔥','😍','🥺','😭','✨','😎','🤔','💜','🌸','🌙','⭐','💫','🎉','👏','🙏','💪',
    '😢','😅','🤣','😌','💕','🌹','🦋','🌊','☀️','🌈','💭','📖','🖤','😴','🥰','💔','😤','🤯',
    '🫶','💖','🌺','✍️','🎶','🌿','🍃','💧','🪐','🌌','🦄','🐾','🫠','🕊️','🌷','🌻','🍂','🍁',
    '⚡','🌪️','🫧','🫀','💎','🔮','🌃','🌉','🗺️','📜','🖊️','🎭','🎨','🎵','🎼','🌠','🌀','💥',
]

function ToolbarButton({ onClick, active, title, children, className = '' }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode; className?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                'h-7 w-7 flex items-center justify-center rounded text-sm transition-colors',
                active ? 'bg-purple-600/30 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/10',
                className
            )}
        >
            {children}
        </button>
    )
}

function Divider() {
    return <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
    const taRef = useRef<HTMLTextAreaElement>(null)
    const [align, setAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left')
    const [font, setFont] = useState(FONTS[0].value)
    const [fontSize, setFontSize] = useState('16')
    const [showEmoji, setShowEmoji] = useState(false)
    const [showColors, setShowColors] = useState(false)
    const [textColor, setTextColor] = useState('#ffffff')
    const [lineHeight, setLineHeight] = useState('1.8')
    const emojiRef = useRef<HTMLDivElement>(null)
    const colorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false)
            if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColors(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const insertAtCursor = (text: string) => {
        const ta = taRef.current; if (!ta) return
        const start = ta.selectionStart; const end = ta.selectionEnd
        const newVal = value.substring(0, start) + text + value.substring(end)
        onChange(newVal)
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + text.length, start + text.length) }, 0)
    }

    const wrapSelection = (open: string, close: string) => {
        const ta = taRef.current; if (!ta) return
        const start = ta.selectionStart; const end = ta.selectionEnd
        const selected = value.substring(start, end)
        const wrapped = open + selected + close
        onChange(value.substring(0, start) + wrapped + value.substring(end))
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + open.length, start + open.length + selected.length) }, 0)
    }

    const insertLine = (prefix: string) => {
        const ta = taRef.current; if (!ta) return
        const start = ta.selectionStart
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const lineEnd = value.indexOf('\n', start)
        const end = lineEnd === -1 ? value.length : lineEnd
        const line = value.substring(lineStart, end)
        const newLine = prefix + line
        onChange(value.substring(0, lineStart) + newLine + value.substring(end))
        setTimeout(() => ta.focus(), 0)
    }

    const handleAlign = (a: typeof align) => {
        setAlign(a)
    }

    const applyColor = (color: string) => {
        setTextColor(color)
        setShowColors(false)
        wrapSelection(`<span style="color:${color}">`, '</span>')
    }

    const wordCount = value.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length

    return (
        <div className="border border-white/10 rounded-xl bg-black/30 overflow-hidden focus-within:border-purple-500/30 transition-colors shadow-lg">
            {/* Toolbar — row 1 */}
            <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/10 bg-white/[0.03]">
                {/* Font family */}
                <div className="relative">
                    <select
                        value={font}
                        onChange={e => setFont(e.target.value)}
                        className="h-7 bg-black/60 border border-white/10 rounded px-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500 pr-5 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                        style={{ minWidth: '110px', fontFamily: font }}
                    >
                        {FONTS.map(f => (
                            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Font size */}
                <div className="relative ml-1">
                    <select
                        value={fontSize}
                        onChange={e => setFontSize(e.target.value)}
                        className="h-7 bg-black/60 border border-white/10 rounded px-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500 pr-5 appearance-none cursor-pointer hover:bg-white/5 transition-colors w-14"
                    >
                        {FONT_SIZES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <Divider />

                {/* Heading */}
                <ToolbarButton onClick={() => wrapSelection('<h1>', '</h1>')} title="Título H1">
                    <Heading1 className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => wrapSelection('<h2>', '</h2>')} title="Título H2">
                    <Heading2 className="w-3.5 h-3.5" />
                </ToolbarButton>

                <Divider />

                {/* Text format */}
                <ToolbarButton onClick={() => wrapSelection('<strong>', '</strong>')} title="Negrito (ctrl+b)">
                    <Bold className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => wrapSelection('<em>', '</em>')} title="Itálico (ctrl+i)">
                    <Italic className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => wrapSelection('<u>', '</u>')} title="Sublinhado">
                    <Underline className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => wrapSelection('<s>', '</s>')} title="Tachado">
                    <Strikethrough className="w-3.5 h-3.5" />
                </ToolbarButton>

                <Divider />

                {/* Alignment */}
                <ToolbarButton onClick={() => handleAlign('left')} active={align === 'left'} title="Alinhar à esquerda">
                    <AlignLeft className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => handleAlign('center')} active={align === 'center'} title="Centralizar">
                    <AlignCenter className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => handleAlign('right')} active={align === 'right'} title="Alinhar à direita">
                    <AlignRight className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => handleAlign('justify')} active={align === 'justify'} title="Justificar">
                    <AlignJustify className="w-3.5 h-3.5" />
                </ToolbarButton>

                <Divider />

                {/* Lists */}
                <ToolbarButton onClick={() => insertLine('• ')} title="Lista com marcadores">
                    <List className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => insertLine('1. ')} title="Lista numerada">
                    <ListOrdered className="w-3.5 h-3.5" />
                </ToolbarButton>

                <Divider />

                {/* Quote */}
                <ToolbarButton onClick={() => wrapSelection('\n> ', '\n')} title="Citação">
                    <Quote className="w-3.5 h-3.5" />
                </ToolbarButton>

                {/* HR */}
                <ToolbarButton onClick={() => insertAtCursor('\n\n---\n\n')} title="Linha divisória">
                    <Minus className="w-3.5 h-3.5" />
                </ToolbarButton>

                <Divider />

                {/* Line height */}
                <div className="relative">
                    <select
                        value={lineHeight}
                        onChange={e => setLineHeight(e.target.value)}
                        title="Espaçamento entre linhas"
                        className="h-7 bg-black/60 border border-white/10 rounded px-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500 pr-5 appearance-none cursor-pointer hover:bg-white/5 transition-colors w-20"
                    >
                        <option value="1.2">Compacto</option>
                        <option value="1.5">Normal</option>
                        <option value="1.8">Relaxado</option>
                        <option value="2.2">Duplo</option>
                        <option value="3">Triplo</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <Divider />

                {/* Color picker */}
                <div className="relative" ref={colorRef}>
                    <button
                        type="button"
                        onClick={() => setShowColors(p => !p)}
                        title="Cor do texto"
                        className="h-7 w-7 flex flex-col items-center justify-center rounded hover:bg-white/10 transition-colors group"
                    >
                        <Type className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                        <div className="w-3.5 h-1 rounded-full mt-0.5" style={{ backgroundColor: textColor }} />
                    </button>
                    {showColors && (
                        <div className="absolute top-9 left-0 z-50 bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl">
                            <p className="text-xs text-gray-500 mb-2">Cor do texto</p>
                            <div className="grid grid-cols-8 gap-1">
                                {TEXT_COLORS.map(c => (
                                    <button
                                        key={c} type="button"
                                        onClick={() => applyColor(c)}
                                        className="w-6 h-6 rounded-md border border-white/10 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Emoji picker */}
                <div className="relative" ref={emojiRef}>
                    <ToolbarButton onClick={() => setShowEmoji(p => !p)} active={showEmoji} title="Emojis">
                        <Smile className="w-3.5 h-3.5" />
                    </ToolbarButton>
                    {showEmoji && (
                        <div className="absolute top-9 left-0 z-50 bg-zinc-900 border border-white/10 rounded-2xl p-3 shadow-2xl w-72">
                            <p className="text-xs text-gray-500 mb-2">Emojis</p>
                            <div className="grid grid-cols-10 gap-0.5 max-h-48 overflow-y-auto">
                                {EMOJIS.map(e => (
                                    <button
                                        key={e} type="button"
                                        onClick={() => { insertAtCursor(e); setShowEmoji(false) }}
                                        className="text-base hover:bg-white/10 rounded-lg p-1 transition-colors leading-none"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <textarea
                ref={taRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || 'Escreva aqui...'}
                className="w-full min-h-[480px] bg-transparent px-6 py-5 text-gray-100 focus:outline-none resize-y leading-relaxed"
                style={{
                    fontFamily: font,
                    fontSize: fontSize + 'px',
                    textAlign: align,
                    lineHeight: lineHeight,
                }}
                spellCheck
                onKeyDown={e => {
                    // Tab inserts spaces instead of moving focus
                    if (e.key === 'Tab') {
                        e.preventDefault()
                        insertAtCursor('    ')
                    }
                }}
            />

            {/* Footer */}
            <div className="px-4 py-2 text-xs text-gray-700 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                <span className="flex items-center gap-3">
                    <span>{value.length} chars</span>
                    <span>{wordCount} palavras</span>
                    <span>{value.split('\n').length} linhas</span>
                </span>
                <span className="text-gray-600">{font.split(',')[0].replace(/"/g, '')} · {fontSize}px · {lineHeight}× espaçamento</span>
            </div>
        </div>
    )
}
