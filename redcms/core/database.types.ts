/**
 * Types générés pour Supabase
 * À régénérer avec: npx supabase gen types typescript
 */

export interface Database {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          sections: unknown;
          seo: unknown;
          status: 'draft' | 'published';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pages']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pages']['Insert']>;
      };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          featured_image: string | null;
          category_id: string | null;
          author_id: string | null;
          tags: string[];
          seo: unknown;
          status: 'draft' | 'published';
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['articles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['articles']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      authors: {
        Row: {
          id: string;
          name: string;
          slug: string;
          bio: string | null;
          avatar: string | null;
          email: string | null;
          socials: unknown;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['authors']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['authors']['Insert']>;
      };
      media: {
        Row: {
          id: string;
          filename: string;
          url: string;
          mime_type: string;
          size: number;
          width: number | null;
          height: number | null;
          alt: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['media']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['media']['Insert']>;
      };
      page_versions: {
        Row: {
          id: string;
          page_id: string;
          sections: unknown;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['page_versions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['page_versions']['Insert']>;
      };
    };
  };
}
