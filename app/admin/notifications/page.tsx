"use client"

import { useState, useEffect } from "react"
import { getNotifications, saveNotifications } from "@/lib/storage"
import { Notification } from "@/types"
import { Button } from "@/components/ui/button"
import { Save, Bell, Info, AlertTriangle, CheckCircle, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        getNotifications().then(setNotifications).catch(() => {})
    }, [])

    const addNotification = () => {
        const newNote: Notification = {
            id: Date.now().toString(),
            text: 'Nova notificação',
            type: 'info',
            active: false,
        }
        setNotifications([...notifications, newNote])
    }

    const removeNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveNotifications(notifications)
        } catch (error) {
            console.error("Error saving notifications:", error)
            alert("Erro ao salvar notificações.")
        } finally {
            setIsSaving(false)
        }
    }

    const updateNotification = (id: string, field: keyof Notification, value: any) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, [field]: value } : n))
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'info': return <Info className="w-4 h-4" />
            case 'warning': return <AlertTriangle className="w-4 h-4" />
            case 'success': return <CheckCircle className="w-4 h-4" />
            default: return <Bell className="w-4 h-4" />
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Notificações</h1>
                    <p className="text-gray-400">Configure avisos e alertas para os leitores.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={addNotification} variant="outline" className="border-white/10 text-gray-300 hover:text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Notificação
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </div>

            {notifications.length === 0 && (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                    <Bell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">Nenhuma notificação criada ainda.</p>
                    <Button onClick={addNotification} className="bg-purple-900 hover:bg-purple-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar primeira notificação
                    </Button>
                </div>
            )}

            <div className="space-y-6">
                {notifications.map((note) => (
                    <div key={note.id} className={cn(
                        "bg-white/5 border rounded-xl p-6 transition-colors",
                        note.active ? "border-purple-500/50" : "border-white/10"
                    )}>
                        <div className="flex justify-end mb-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => removeNotification(note.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-2">Mensagem do Aviso</label>
                                    <input
                                        type="text"
                                        value={note.text}
                                        onChange={(e) => updateNotification(note.id, 'text', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-2">Link (Opcional)</label>
                                    <input
                                        type="text"
                                        value={note.link || ''}
                                        onChange={(e) => updateNotification(note.id, 'link', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-400 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-64 space-y-4 border-l border-white/10 md:pl-6">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-2">Status</label>
                                    <button
                                        onClick={() => updateNotification(note.id, 'active', !note.active)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm w-full transition-colors",
                                            note.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-gray-400 border border-white/10"
                                        )}
                                    >
                                        <div className={cn("w-2 h-2 rounded-full", note.active ? "bg-emerald-400 animate-pulse" : "bg-gray-500")} />
                                        {note.active ? "Ativo no Site" : "Inativo"}
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-2">Tipo</label>
                                    <div className="flex gap-2">
                                        {['info', 'warning', 'success'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => updateNotification(note.id, 'type', type)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors border",
                                                    note.type === type
                                                        ? "bg-purple-500/20 text-purple-300 border-purple-500/20"
                                                        : "bg-transparent text-gray-500 border-transparent hover:bg-white/5"
                                                )}
                                                title={type}
                                            >
                                                {getTypeIcon(type)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
