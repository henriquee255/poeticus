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

export interface SiteSettings {
    name: string;
    description: string;
    authorName?: string;
    instagramUrl?: string;
}
