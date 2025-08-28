
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 324 323"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="88.1023"
        y="144.792"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 88.1023 144.792)"
        fill="currentColor"
      />
      <rect
        x="85.3459"
        y="244.537"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 85.3459 244.537)"
        fill="currentColor"
      />
    </svg>
  );
};

// Hamburger icon component
const HamburgerIcon = ({
  className,
  ...props
}: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.75)]"
    />
    <path
      d="M4 12L20 12"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.75)]"
    />
    <path
      d="M4 12L20 12"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.75)]"
    />
  </svg>
);

export interface Navbar01Props extends React.HTMLAttributes<HTMLElement> {
  links?: {
    label: string;
    href: string;
    onClick?: () => void;
    main?: boolean;
  }[];
  logo?: React.ReactNode;
  logoHref?: string;
  action?: React.ReactNode;
}

export const NavbarNew = ({
  className,
  links = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Sign Up', href: '#', main: true },
  ],
  logo = <Logo />,
  logoHref = '#',
  action,
  ...props
}: Navbar01Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header
      className={cn(
        'relative w-full border-b border-b-zinc-200 bg-white/80 py-4 backdrop-blur-lg dark:border-b-zinc-800 dark:bg-zinc-950/80',
        className
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <a className="flex items-center gap-2" href={logoHref}>
            {logo}
            <span className="text-lg font-bold">Chanomhub</span>
          </a>
          {isMounted && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {links
                  .filter((link) => !link.main)
                  .map((link) => (
                    <NavigationMenuItem key={link.label}>
                      <NavigationMenuLink
                        href={link.href}
                        onClick={(e) => {
                          if (link.onClick) {
                            e.preventDefault();
                            link.onClick();
                          }
                        }}
                        className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-zinc-100/50 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800 dark:data-[active]:bg-zinc-800/50"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {action}
          {links.find((link) => link.main) && (
            <Button asChild>
              <a href={links.find((link) => link.main)?.href}>
                {links.find((link) => link.main)?.label}
              </a>
            </Button>
          )}
        </div>

        <div className="flex items-center md:hidden">
          {isMounted && (
            <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={popoverTriggerRef}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'group h-8 w-8 rounded-full data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800',
                    isMenuOpen &&
                      'data-[state=open]:[&>svg>path:first-child]:-translate-y-0 data-[state=open]:[&>svg>path:first-child]:rotate-45 data-[state=open]:[&>svg>path:last-child]:-translate-y-0 data-[state=open]:[&>svg>path:last-child]:-rotate-45 data-[state=open]:[&>svg>path:nth-child(2)]:opacity-0'
                  )}
                  aria-label="Toggle Menu"
                >
                  <HamburgerIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="mt-2 w-56 rounded-xl p-2"
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                  popoverTriggerRef.current?.focus();
                }}
              >
                <div className="flex flex-col items-start">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => {
                        if (link.onClick) {
                          e.preventDefault();
                          link.onClick();
                        }
                        setIsMenuOpen(false);
                      }}
                      className={cn(
                        'w-full rounded-lg px-4 py-2 text-left text-sm font-medium',
                        link.main
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      {link.label}
                    </a>
                  ))}
                  {action && <div className="mt-2 w-full">{action}</div>}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
};
