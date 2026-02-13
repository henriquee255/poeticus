import { Post, Ad, Notification, SiteSettings, Category } from "@/types"

const API_ROUTES = {
    POSTS: '/api/posts',
    ADS: '/api/ads',
    NOTIFICATIONS: '/api/notifications',
    CATEGORIES: '/api/categories',
    SETTINGS: '/api/settings',
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
    delete (dbPost as any).author
    delete (dbPost as any).readTime
    delete (dbPost as any).coverImage

    return fetchApi(API_ROUTES.POSTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPost)
    })
}

export const deletePost = async (id: string) => {
    // Note: Need a DELETE route or handle in POST
    // For now, let's assume we might need a specific delete route
    return fetchApi(`${API_ROUTES.POSTS}/${id}`, { method: 'DELETE' })
}

// Categories
export const getCategories = async (): Promise<Category[]> => fetchApi(API_ROUTES.CATEGORIES)
export const saveCategories = async (categories: Category[]) => {
    // Simplified: our API currently takes one at a time or we can adjust it
    // For now, let's just implement the fetch for the UI
    return fetchApi(API_ROUTES.CATEGORIES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories })
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
