import Link from "next/link"
import { Instagram, Mail } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="text-2xl font-bold tracking-tighter text-white font-serif mb-4 block">
                            Poeticus<span className="text-purple-500">.</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Um refúgio digital para a alma. Poemas, poesias e reflexões para quem busca profundidade em cada palavra.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Navegação</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/" className="hover:text-purple-400 transition-colors">Início</Link></li>
                            <li><Link href="/poemas" className="hover:text-purple-400 transition-colors">Poemas</Link></li>
                            <li><Link href="/autores" className="hover:text-purple-400 transition-colors">Autores</Link></li>
                            <li><Link href="/contato" className="hover:text-purple-400 transition-colors">Contato</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Categorias</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/categoria/amor" className="hover:text-purple-400 transition-colors">Amor</Link></li>
                            <li><Link href="/categoria/tristeza" className="hover:text-purple-400 transition-colors">Melancolia</Link></li>
                            <li><Link href="/categoria/existencial" className="hover:text-purple-400 transition-colors">Existencial</Link></li>
                            <li><Link href="/categoria/esperanca" className="hover:text-purple-400 transition-colors">Esperança</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Newsletter</h4>
                        <p className="text-gray-400 text-sm mb-4">Receba um poema exclusivo toda semana no seu e-mail.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Seu e-mail"
                                className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-purple-500 transition-colors"
                            />
                            <button className="bg-purple-900 hover:bg-purple-800 text-white px-3 py-2 rounded-md transition-colors">
                                <Mail className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs">
                        © {new Date().getFullYear()} Poeticus. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Instagram className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
