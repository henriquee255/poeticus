import { Post } from "@/types";

export const posts: Post[] = [
    {
        id: '1',
        title: "O Peso do Silêncio",
        slug: "o-peso-do-silencio",
        excerpt: "Às vezes, o que não dizemos grita mais alto que qualquer tempestade. O silêncio tem seu próprio idioma.",
        content: `
      <p>O silêncio não é vazio.<br>
      É cheio de respostas que temos medo de ouvir.<br>
      É o grito estagnado na garganta,<br>
      A palavra que morreu antes de nascer.</p>
      
      <p>Carrego o peso do que não disse,<br>
      Como pedras nos bolsos de um casaco velho.<br>
      E afundo, lentamente,<br>
      No mar das minhas próprias omissões.</p>
    `,
        category: "Tristeza",
        date: "10 Fev, 2026",
        readTime: "3 min",
        author: {
            name: "Isabella Viana",
        },
        featured: true,
        color: "from-blue-900/20 to-purple-900/20",
        status: 'published'
    },
    {
        id: '2',
        title: "Fragmentos de Nós",
        slug: "fragmentos-de-nos",
        excerpt: "Éramos dois universos colidindo, criando estrelas e buracos negros ao mesmo tempo.",
        content: `
      <p>Teus olhos eram galáxias<br>
      Onde me perdi sem mapa ou bússola.<br>
      Colidimos como astros desgovernados,<br>
      Uma explosão de luz e caos.</p>
      
      <p>Agora, restam apenas poeira estelar<br>
      E a memória de um brilho<br>
      Que cegava tanto quanto aquecia.</p>
    `,
        category: "Amor",
        date: "08 Fev, 2026",
        readTime: "4 min",
        author: {
            name: "Lucas Paiva",
        },
        featured: true,
        color: "from-pink-900/20 to-red-900/20",
        status: 'published'
    },
    {
        id: '3',
        title: "A Dança do Tempo",
        slug: "a-danca-do-tempo",
        excerpt: "O tempo não cura nada, ele apenas nos ensina a dançar com a dor.",
        content: `
      <p>Tic-tac, o relógio não espera.<br>
      Ele marcha, indiferente, sobre nossos sonhos e medos.<br>
      Não há cura no passar das horas,<br>
      Apenas a cicatriz que endurece a pele.</p>
      
      <p>Dançamos com a saudade,<br>
      Uma valsa lenta em um salão vazio.<br>
      E o tempo, maestro cruel,<br>
      Nunca para a música.</p>
    `,
        category: "Reflexões",
        date: "05 Fev, 2026",
        readTime: "5 min",
        author: {
            name: "Isabella Viana",
        },
        featured: true,
        color: "from-emerald-900/20 to-teal-900/20",
        status: 'published'
    },
    {
        id: '4',
        title: "Horizonte Perdido",
        slug: "horizonte-perdido",
        excerpt: "Caminhei até onde a vista alcança, mas o horizonte sempre fugia.",
        content: `
      <p>A linha que divide o céu e o mar<br>
      É uma promessa que nunca se cumpre.<br>
      Caminho, corro, busco,<br>
      Mas o fim é sempre um recomeço distante.</p>
    `,
        category: "Existencial",
        date: "01 Fev, 2026",
        readTime: "2 min",
        author: {
            name: "Marco Esteves",
        },
        color: "from-gray-900/20 to-slate-900/20",
        status: 'published'
    },
    {
        id: '5',
        title: "Chama da Esperança",
        slug: "chama-da-esperanca",
        excerpt: "Mesmo na noite mais escura, uma pequena chama pode guiar o caminho.",
        content: `
      <p>Não apague a luz,<br>
      Por menor que ela pareça.<br>
      É no breu que a centelha<br>
      Se torna farol.</p>
    `,
        category: "Esperança",
        date: "28 Jan, 2026",
        readTime: "1 min",
        author: {
            name: "Sofia Luz",
        },
        color: "from-yellow-900/20 to-amber-900/20",
        status: 'published'
    }
];

export function getAllPosts(): Post[] {
    return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
    return posts.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: string): Post[] {
    if (category === 'Todas') return posts;
    return posts.filter((post) => post.category.toLowerCase() === category.toLowerCase() || post.category === category);
}

export function getFeaturedPosts(): Post[] {
    return posts.filter(post => post.featured);
}
