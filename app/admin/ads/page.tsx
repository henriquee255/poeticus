"use client"

import { useState, useEffect } from "react"
import { getAds, saveAds } from "@/lib/storage"
import { Ad } from "@/types"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, Layout } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdsPage() {
    const [ads, setAds] = useState<Ad[]>([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setAds(getAds())
    }, [])

    const handleSave = () => {
        setIsSaving(true)
        saveAds(ads)
        setTimeout(() => setIsSaving(false), 500)
    }

    const toggleAd = (id: string) => {
        setAds(ads.map(ad => ad.id === id ? { ...ad, active: !ad.active } : ad))
    }

    const updateAd = (id: string, field: keyof Ad, value: any) => {
        setAds(ads.map(ad => ad.id === id ? { ...ad, [field]: value } : ad))
    }

    const LOCATION_LABELS = {
        'header': 'Topo (Header)',
        'sidebar': 'Barra Lateral',
        'post-footer': 'Rodapé do Post'
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Gerenciar Anúncios</h1>
                    <p className="text-gray-400">Configure os banners de publicidade do site.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {ads.map((ad) => (
                    <div key={ad.id} className={cn(
                        "bg-white/5 border rounded-xl p-6 transition-colors",
                        ad.active ? "border-purple-500/50" : "border-white/10"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", ad.active ? "bg-purple-500/20 text-purple-300" : "bg-white/10 text-gray-500")}>
                                    <Layout className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{ad.title}</h3>
                                    <p className="text-xs text-gray-500 uppercase">{LOCATION_LABELS[ad.location]}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">{ad.active ? 'Ativo' : 'Inativo'}</span>
                                <button
                                    onClick={() => toggleAd(ad.id)}
                                    className={cn(
                                        "w-12 h-6 rounded-full relative transition-colors",
                                        ad.active ? "bg-purple-600" : "bg-white/10"
                                    )}
                                >
                                    <span className={cn(
                                        "block w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
                                        ad.active ? "left-7" : "left-1"
                                    )} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">URL da Imagem</label>
                                <input
                                    type="text"
                                    value={ad.imageUrl || ''}
                                    onChange={(e) => updateAd(ad.id, 'imageUrl', e.target.value)}
                                    placeholder="https://exemplo.com/banner.jpg"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Link de Destino</label>
                                <input
                                    type="text"
                                    value={ad.linkUrl || ''}
                                    onChange={(e) => updateAd(ad.id, 'linkUrl', e.target.value)}
                                    placeholder="https://loja.com/produto"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                                />
                            </div>
                        </div>

                        {ad.imageUrl && (
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 uppercase mb-2">Pré-visualização</p>
                                <img src={ad.imageUrl} alt="Preview" className="max-h-32 rounded-lg border border-white/10 opacity-75 hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
