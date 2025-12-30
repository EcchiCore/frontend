"use client";

import Link from "next/link";
import { useMdxContext } from "./MdxContext";
import type { AnchorHTMLAttributes } from "react";

interface MdxLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href?: string;
}

export function MdxLink({ href, children, ...props }: MdxLinkProps) {
    const { locale } = useMdxContext();
    const cleanLocale = locale?.trim() || 'th';

    // Handle internal links - prepend locale if missing
    let finalHref = href || "#";

    if (href && href.startsWith("/") && !href.startsWith("//")) {
        // Check if locale is already present
        const localePattern = /^\/(th|en)\//;
        if (!localePattern.test(href)) {
            finalHref = `/${cleanLocale}${href}`;
        }
    }

    const isExternal = href?.startsWith("http") || href?.startsWith("//");

    if (isExternal) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative text-cyan-300 hover:text-cyan-100 transition-all duration-300 group inline-block"
                {...props}
            >
                <span className="relative z-10">{children}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
                <span className="absolute inset-0 bg-cyan-400/10 scale-0 group-hover:scale-100 rounded transition-transform duration-200 blur-sm"></span>
            </a>
        );
    }

    return (
        <Link
            href={finalHref}
            className="relative text-cyan-300 hover:text-cyan-100 transition-all duration-300 group inline-block"
            {...props}
        >
            <span className="relative z-10">{children}</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
            <span className="absolute inset-0 bg-cyan-400/10 scale-0 group-hover:scale-100 rounded transition-transform duration-200 blur-sm"></span>
        </Link>
    );
}
