export type Category = string; // Allow dynamic categories

export interface Author {
    name: string;
    avatar?: string;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: Category;
    date: string;
    readTime: string;
    coverImage?: string; // Base64 or URL
    author: Author;
    featured?: boolean;
    color?: string;
    status: 'published' | 'draft';
    likes?: number;
    shares?: number;
}

export interface Ad {
    id: string;
    location: 'header' | 'sidebar' | 'post-footer';
    imageUrl?: string;
    linkUrl?: string;
    script?: string;
    active: boolean;
    title: string;
}

export interface Notification {
    id: string;
    text: string;
    link?: string;
    active: boolean;
    type: 'info' | 'warning' | 'success';
}

export interface Book {
    id: string;
    title: string;
    slug: string;
    description?: string;
    cover_image?: string;
    author_name?: string;
    status: 'published' | 'draft';
    created_at?: string;
}

export interface Chapter {
    id: string;
    book_id: string;
    title: string;
    content?: string;
    chapter_number: number;
    created_at?: string;
}

export interface SiteSettings {
    name: string;
    description: string;
    authorName?: string;
    instagramUrl?: string;
}
