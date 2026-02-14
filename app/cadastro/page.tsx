"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

export default function CadastroPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.")
            setLoading(false)
            return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) {
            setError(signUpError.message === 'User already registered' ? 'Este email já está cadastrado.' : signUpError.message)
            setLoading(false)
            return
        }

        if (data.user) {
            await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: data.user.id, username: username || email.split('@')[0] })
            })
            // Create profile via REST
            const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
            const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            await fetch(`${URL}/rest/v1/profiles`, {
                method: 'POST',
                headers: {
                    'apikey': KEY!, 'Authorization': `Bearer ${KEY}`,
                    'Content-Type': 'application/json', 'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ id: data.user.id, username: username || email.split('@')[0] })
            })
        }

        router.push("/")
        router.refresh()
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold font-serif text-white">
                        Poeticus<span className="text-purple-500">.</span>
                    </Link>
                    <p className="text-gray-400 mt-2">Crie sua conta</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Nome de usuário</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="seunome"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="mínimo 6 caracteres"
                                required
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                        >
                            {loading ? "Criando conta..." : "Criar conta"}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        Já tem conta?{" "}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                            Entrar
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
