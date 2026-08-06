import Link from 'next/link';
import { ExternalLink, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { siteConfig } from '@/config/site';

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-background">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Shield className="size-5 text-primary" />
                            <span className="text-base">{siteConfig.name}</span>
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {siteConfig.description}
                        </p>
                    </div>

                    {siteConfig.footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold text-foreground">
                                {section.title}
                            </h3>
                            <ul className="mt-3 flex flex-col gap-2">
                                {section.links.map((link) => (
                                    <li key={link.title}>
                                        <Link
                                            href={link.href}
                                            target={link.external ? '_blank' : undefined}
                                            rel={link.external ? 'noopener noreferrer' : undefined}
                                            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {link.title}
                                            {link.external && (
                                                <ExternalLink className="size-3 opacity-50" />
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
                        reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href={siteConfig.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            GitHub
                        </Link>
                        <span className="text-xs text-muted-foreground">
                            v{siteConfig.version}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
