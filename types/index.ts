import { type LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
  external?: boolean;
}

export interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SiteConfig {
  name: string;
  description: string;
  version: string;
  author: {
    name: string;
    url: string;
  };
  github: string;
  url: string;
  navigation: NavItem[];
  footerSections: FooterSection[];
}
