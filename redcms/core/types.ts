/**
 * Types RedCMS Core
 */

export interface RedCMSConfig {
  siteName: string;
  enabledSections: string[];
  options: {
    blogEnabled: boolean;
    maxVersions: number;
  };
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
  seo: SEOData;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  type: string;
  order: number;
  data: Record<string, unknown>;
}

export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  authorId?: string;
  tags: string[];
  seo: SEOData;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  email?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  createdAt: string;
}
