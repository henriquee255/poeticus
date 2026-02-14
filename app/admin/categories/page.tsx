"use client"

import { useState, useEffect } from "react"
import { getCategories, addCategory, deleteCategory } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Tag, Loader2 } from "lucide-react"

export default function CategoriesPage() {
    const [categories, setCategories] = useState<string[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        try {
            const data = await getCategories()
            setCategories(data)
        } catch (error) {
            console.error("Error loading categories:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = async () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setIsUpdating(true)
            try {
                await addCategory(newCategory.trim())
                await loadCategories()
                setNewCategory("")
            } catch (error) {
                console.error("Error adding category:", error)
                alert("Erro ao adicionar categoria")
            } finally {
                setIsUpdating(false)
            }
        }
    }

    const handleRemove = async (cat: string) => {
        if (confirm(`Remover categoria "${cat}"?`)) {
            setIsUpdating(true)
            try {
                await deleteCategory(cat)
                await loadCategories()
            } catch (error) {
                console.error("Error removing category:", error)
                alert("Erro ao remover categoria")
            } finally {
                setIsUpdating(false)
            }
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Categorias</h1>
                    <p className="text-gray-400">Gerencie as tags e sessões do blog.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* List of Categories */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Categorias Ativas</h3>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <div key={cat} className="flex items-center justify-between p-3 bg-black/50 border border-white/5 rounded-lg group">
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-4 h-4 text-purple-500" />
                                        <span className="text-gray-300">{cat}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(cat)}
                                        disabled={isUpdating}
                                        className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">Nenhuma categoria encontrada.</p>
                            )}
                        </div>
                    )}
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
                            disabled={isUpdating}
                            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <Button
                            onClick={handleAdd}
                            variant="outline"
                            disabled={isUpdating || !newCategory.trim()}
                            className="border-white/10 hover:bg-white/5 hover:text-white"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
