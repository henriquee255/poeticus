"use client"

import { useState, useEffect } from "react"
import { getAds, saveAds } from "@/lib/storage"
import { Ad } from "@/types"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, Layout, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const IMAGE_SPECS: Record<Ad['location'], { label: string; size: string; ratio: string }> = {
    'header': { label: 'Topo (Header)', size: '1200 × 200 px', ratio: '6:1' },
    'sidebar': { label: 'Barra Lateral', size: '300 × 250 px', ratio: '6:5' },
    'post-footer': { label: 'Rodapé do Post', size: '728 × 90 px', ratio: '8:1' },
}

const LOCATION_OPTIONS: Ad['location'][] = ['header', 'sidebar', 'post-footer']

export default function AdsPage() {
    const [ads, setAds] = useState<Ad[]>([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        getAds().then(setAds).catch(console.error)
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveAds(ads)
            alert("Anúncios salvos!")
        } catch {
            alert("Erro ao salvar anúncios.")
        } finally {
            setIsSaving(false)
        }
    }

    const addAd = () => {
        const newAd: Ad = {
            id: Date.now().toString(),
            title: "Novo Anúncio",
            location: 'header',
            active: false,
            imageUrl: '',
            linkUrl: '',
        }
        setAds([...ads, newAd])
    }

    const removeAd = (id: string) => {
        if (!confirm("Excluir este anúncio?")) return
        setAds(ads.filter(a => a.id !== id))
    }

    const toggleAd = (id: string) => {
        setAds(ads.map(ad => ad.id === id ? { ...ad, active: !ad.active } : ad))
    }

    const updateAd = (id: string, field: keyof Ad, value: any) => {
        setAds(ads.map(ad => ad.id === id ? { ...ad, [field]: value } : ad))
    }

    const activeHeaderAds = ads.filter(a => a.location === 'header' && a.active)

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Gerenciar Anúncios</h1>
                    <p className="text-gray-400">Configure os banners de publicidade do site.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={addAd} variant="outline" className="border-white/10 text-gray-300 hover:text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Anúncio
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </div>

            {/* Info tamanhos */}
            <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4 mb-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm text-purple-300 font-medium mb-2">Tamanhos recomendados de imagem</p>
                    <div className="flex flex-wrap gap-4">
                        {LOCATION_OPTIONS.map(loc => (
                            <div key={loc} className="text-xs text-gray-400">
                                <span className="text-gray-300">{IMAGE_SPECS[loc].label}:</span>{' '}
                                <span className="font-mono text-purple-300">{IMAGE_SPECS[loc].size}</span>{' '}
                                <span className="text-gray-600">({IMAGE_SPECS[loc].ratio})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Info carrossel */}
            {activeHeaderAds.length > 1 && (
                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-3 mb-6 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-300">
                        <strong>{activeHeaderAds.length} anúncios ativos</strong> no header — vão alternar automaticamente com setas de navegação.
                    </p>
                </div>
            )}

            {ads.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                    <Layout className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">Nenhum anúncio criado ainda.</p>
                    <Button onClick={addAd} className="bg-purple-900 hover:bg-purple-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar primeiro anúncio
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {ads.map((ad) => {
                        const spec = IMAGE_SPECS[ad.location]
                        return (
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
                                            <input
                                                type="text"
                                                value={ad.title}
                                                onChange={e => updateAd(ad.id, 'title', e.target.value)}
                                                className="bg-transparent text-lg font-bold text-white focus:outline-none border-b border-transparent focus:border-purple-500"
                                            />
                                            <p className="text-xs text-gray-500 uppercase">{spec.label}</p>
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
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            onClick={() => removeAd(ad.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase mb-2">Localização</label>
                                        <select
                                            value={ad.location}
                                            onChange={e => updateAd(ad.id, 'location', e.target.value as Ad['location'])}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {LOCATION_OPTIONS.map(loc => (
                                                <option key={loc} value={loc}>{IMAGE_SPECS[loc].label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase mb-2">
                                            URL da Imagem
                                            <span className="ml-2 text-purple-400 font-mono normal-case">{spec.size}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={ad.imageUrl || ''}
                                            onChange={e => updateAd(ad.id, 'imageUrl', e.target.value)}
                                            placeholder="https://exemplo.com/banner.jpg"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase mb-2">Link de Destino</label>
                                        <input
                                            type="text"
                                            value={ad.linkUrl || ''}
                                            onChange={e => updateAd(ad.id, 'linkUrl', e.target.value)}
                                            placeholder="https://loja.com/produto"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                                        />
                                    </div>
                                </div>

                                {ad.imageUrl && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 uppercase mb-2">Pré-visualização</p>
                                        <img src={ad.imageUrl} alt="Preview" className="max-h-32 rounded-lg border border-white/10 opacity-75 hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
