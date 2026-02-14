import { Post, Ad, Notification, SiteSettings, Category, Book, Chapter } from "@/types"

const API_ROUTES = {
    POSTS: '/api/posts',
    ADS: '/api/ads',
    NOTIFICATIONS: '/api/notifications',
    CATEGORIES: '/api/categories',
    SETTINGS: '/api/settings',
    LIVROS: '/api/livros',
}

// Helper for fetch
const fetchApi = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`API error: ${res.statusText}`)
    return res.json()
}

// --- API ---

// Posts
export const getPosts = async (): Promise<Post[]> => {
    const data = await fetchApi(API_ROUTES.POSTS)
    // Map database fields to TypeScript fields if necessary
    return data.map((p: any) => ({
        ...p,
        author: { name: p.author_name },
        readTime: p.read_time,
        coverImage: p.cover_image
    }))
}

export const getPostById = async (id: string): Promise<Post | undefined> => {
    const posts = await getPosts()
    return posts.find(p => p.id === id)
}

export const savePost = async (post: Post) => {
    // Map TypeScript fields to database fields
    const dbPost = {
        ...post,
        author_name: post.author.name,
        read_time: post.readTime,
        cover_image: post.coverImage
    }
    // Delete the original TS fields that don't exist in DB
    delete (dbPost as any).id
    delete (dbPost as any).author
    delete (dbPost as any).readTime
    delete (dbPost as any).coverImage

    return fetchApi(API_ROUTES.POSTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPost)
    })
}

export const updatePost = async (post: Post) => {
    const dbPost = {
        ...post,
        author_name: post.author.name,
        read_time: post.readTime,
        cover_image: post.coverImage
    }
    delete (dbPost as any).author
    delete (dbPost as any).readTime
    delete (dbPost as any).coverImage
    const { id, ...body } = dbPost as any

    return fetchApi(`${API_ROUTES.POSTS}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
}

export const deletePost = async (id: string) => {
    return fetchApi(`${API_ROUTES.POSTS}/${id}`, { method: 'DELETE' })
}

export const likePost = async (id: string) => {
    return fetchApi(API_ROUTES.POSTS, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'like' })
    })
}

export const sharePost = async (id: string) => {
    return fetchApi(API_ROUTES.POSTS, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'share' })
    })
}

// Categories
export const getCategories = async (): Promise<string[]> => fetchApi(API_ROUTES.CATEGORIES)

export const addCategory = async (name: string) => {
    return fetchApi(API_ROUTES.CATEGORIES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
}

export const deleteCategory = async (name: string) => {
    return fetchApi(`${API_ROUTES.CATEGORIES}?name=${encodeURIComponent(name)}`, {
        method: 'DELETE'
    })
}

// Ads
export const getAds = async (): Promise<Ad[]> => fetchApi(API_ROUTES.ADS)
export const saveAds = async (ads: Ad[]) => fetchApi(API_ROUTES.ADS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ads)
})

// Notifications
export const getNotifications = async (): Promise<Notification[]> => fetchApi(API_ROUTES.NOTIFICATIONS)
export const saveNotifications = async (notes: Notification[]) => fetchApi(API_ROUTES.NOTIFICATIONS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notes)
})

// Settings
export const getSettings = async (): Promise<SiteSettings> => fetchApi(API_ROUTES.SETTINGS)
export const saveSettings = async (settings: SiteSettings) => fetchApi(API_ROUTES.SETTINGS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
})

// Authentication (Keep in localStorage for now as it's just session marker)
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('poeticus_auth') === 'true'
}

export const login = () => {
    if (typeof window !== 'undefined') localStorage.setItem('poeticus_auth', 'true')
}

export const logout = () => {
    if (typeof window !== 'undefined') localStorage.setItem('poeticus_auth', 'false')
}

// Books
export const getBooks = async (): Promise<Book[]> => fetchApi(API_ROUTES.LIVROS)

export const getBookById = async (id: string): Promise<Book> =>
    fetchApi(`${API_ROUTES.LIVROS}/${id}`)

export const saveBook = async (book: Omit<Book, 'id' | 'created_at'>) =>
    fetchApi(API_ROUTES.LIVROS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
    })

export const updateBook = async (id: string, book: Partial<Book>) =>
    fetchApi(`${API_ROUTES.LIVROS}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
    })

export const deleteBook = async (id: string) =>
    fetchApi(`${API_ROUTES.LIVROS}/${id}`, { method: 'DELETE' })

// Chapters
export const getChapters = async (bookId: string): Promise<Chapter[]> =>
    fetchApi(`${API_ROUTES.LIVROS}/${bookId}/capitulos`)

export const saveChapter = async (bookId: string, chapter: Omit<Chapter, 'id' | 'book_id' | 'created_at'>) =>
    fetchApi(`${API_ROUTES.LIVROS}/${bookId}/capitulos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapter)
    })

export const updateChapter = async (bookId: string, capId: string, data: Partial<Chapter>) =>
    fetchApi(`${API_ROUTES.LIVROS}/${bookId}/capitulos/${capId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

export const deleteChapter = async (bookId: string, capId: string) =>
    fetchApi(`${API_ROUTES.LIVROS}/${bookId}/capitulos/${capId}`, { method: 'DELETE' })

// Page Views
export const trackView = async (slug: string, type: 'post' | 'livro') => {
    try {
        await fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, type })
        })
    } catch { /* silently fail */ }
}

export const getViewStats = async () =>
    fetchApi('/api/views')
