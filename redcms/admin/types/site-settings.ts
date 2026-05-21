// Types for site settings (header, footer)

export interface NavItem {
  id: string;
  label: string;
  url: string;
  children: NavItem[];
}

export interface HeaderSettings {
  logo: {
    text: string;
    image: string | null;
  };
  navigation: NavItem[];
  cta: {
    text: string;
    url: string;
    visible: boolean;
  };
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'github' | 'youtube';
  url: string;
}

export interface FooterSettings {
  logo: {
    text: string;
    image: string | null;
  };
  description: string;
  columns: FooterColumn[];
  social: SocialLink[];
  copyright: string;
  poweredBy: {
    visible: boolean;
    text: string;
  };
}

export interface SiteSettings {
  header: HeaderSettings;
  footer: FooterSettings;
}
