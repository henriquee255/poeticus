"use client"

import { useState, useEffect } from "react"
import { getCategories, saveCategories } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, Tag } from "lucide-react"

export default function CategoriesPage() {
    const [categories, setCategories] = useState<string[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setCategories(getCategories())
    }, [])

    const handleSave = () => {
        setIsSaving(true)
        saveCategories(categories)
        setTimeout(() => setIsSaving(false), 500)
    }

    const addCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()])
            setNewCategory("")
        }
    }

    const removeCategory = (cat: string) => {
        if (confirm(`Remover categoria "${cat}"?`)) {
            setCategories(categories.filter(c => c !== cat))
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Categorias</h1>
                    <p className="text-gray-400">Gerencie as tags e sessões do blog.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* List of Categories */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Categorias Ativas</h3>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <div key={cat} className="flex items-center justify-between p-3 bg-black/50 border border-white/5 rounded-lg group">
                                <div className="flex items-center gap-3">
                                    <Tag className="w-4 h-4 text-purple-500" />
                                    <span className="text-gray-300">{cat}</span>
                                </div>
                                <button
                                    onClick={() => removeCategory(cat)}
                                    className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add New */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
                    <h3 className="text-lg font-medium text-white mb-4">Adicionar Nova</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Nome da categoria..."
                            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                        />
                        <Button onClick={addCategory} variant="outline" className="border-white/10 hover:bg-white/5 hover:text-white">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
