// NavbarLinks.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, User } from "lucide-react";
import Cookies from "js-cookie";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavLink {
  id: string;
  name: string;
  transKey?: string;
  link?: string;
  subLinks?: NavLink[];
}

interface NavbarLinksProps {
  section: 'left' | 'right';
  onCloseMenu?: () => void;
  isMobile?: boolean;
}

export default function NavbarLinks({ section, onCloseMenu = () => {}, isMobile = false }: NavbarLinksProps) {
  const [leftNavLinks, setLeftNavLinks] = useState<NavLink[]>([]);
  const [rightNavLinks, setRightNavLinks] = useState<NavLink[]>([]);
  const [isClient, setIsClient] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navbar");
  const locale = (params?.locale as string) || "th";

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLocalizedHref = useCallback(
    (path: string, targetLocale?: string) => {
      if (path.startsWith("http")) return path;
      if (path === "/") return `/${targetLocale || locale}`;
      const newLocale = targetLocale || locale;
      if (path.startsWith("/")) {
        const segments = path.split("/");
        if (["th", "en"].includes(segments[1])) {
          segments[1] = newLocale;
        } else {
          segments.unshift("", newLocale);
        }
        return segments.join("/");
      }
      return `/${newLocale}/${path}`;
    },
    [locale]
  );

  const changeLanguage = useCallback((lang: string) => {
    let targetPath = pathname || "";
    if (pathname && pathname.startsWith(`/${locale}/`)) {
      targetPath = pathname.substring(locale.length + 2);
    } else if (pathname === `/${locale}`) {
      targetPath = "/";
    }
    const newPath = getLocalizedHref(targetPath, lang);
    router.push(newPath);
    onCloseMenu();
  }, [pathname, locale, getLocalizedHref, router, onCloseMenu]);

  useEffect(() => {
    if (!isClient) return;

    const token = Cookies.get("token");

    // Left navigation links (Search, Extensions)
    const leftLinks: NavLink[] = [
      { 
        id: "search", 
        name: t("search"), 
        transKey: "search", 
        link: getLocalizedHref("/search") 
      },
      {
        id: "extensions",
        name: t("extensions"),
        transKey: "extensions",
        subLinks: [
          { 
            id: "extensions-app", 
            name: t("loadApp"), 
            transKey: "loadApp", 
            link: getLocalizedHref("/application") 
          },
          {
            id: "extensions-status",
            name: t("webStatus"),
            transKey: "webStatus",
            link: "https://status.chanomhub.online/status/all",
          },
        ],
      },
    ];

    // Right navigation links (Language, Member if authenticated)
    const rightLinks: NavLink[] = [
      {
        id: "language",
        name: t("language"),
        transKey: "language",
        subLinks: [
          { 
            id: "lang-en", 
            name: t("english"), 
            transKey: "english", 
            link: "#" 
          },
          { 
            id: "lang-th", 
            name: t("thai"), 
            transKey: "thai", 
            link: "#" 
          },
        ],
      },
    ];

    if (token) {
      rightLinks.push({
        id: "member",
        name: t("member"),
        transKey: "member",
        subLinks: [
          { 
            id: "member-dashboard", 
            name: t("dashboard"), 
            transKey: "dashboard", 
            link: getLocalizedHref("/member/dashboard") 
          },
          { 
            id: "member-profile", 
            name: t("profile"), 
            transKey: "profile", 
            link: getLocalizedHref("/member/profile") 
          },
          { 
            id: "member-settings", 
            name: t("settings"), 
            transKey: "settings", 
            link: getLocalizedHref("/member/settings") 
          },
          { 
            id: "member-contact", 
            name: t("contact"), 
            transKey: "contact", 
            link: getLocalizedHref("/contact") 
          },
          { 
            id: "member-logout", 
            name: t("logout"), 
            transKey: "logout", 
            link: getLocalizedHref("/logout") 
          },
        ],
      });
    }

    setLeftNavLinks(leftLinks);
    setRightNavLinks(rightLinks);
  }, [isClient, locale, pathname, t, getLocalizedHref]);

  if (!isClient) {
    return <div className={isMobile ? "space-y-2" : "flex items-center gap-4"} />;
  }

  const linksToRender = section === 'left' ? leftNavLinks : rightNavLinks;

  return (
    <div className={isMobile ? "space-y-2" : "flex items-center gap-4"}>
      {linksToRender.map((item) => (
        <div key={item.id} className={isMobile ? "w-full" : "w-auto"}>
          {item.subLinks ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`
                    flex items-center gap-2 text-sm lg:text-base hover:bg-accent
                    ${isMobile 
                      ? "justify-between w-full h-10 px-3" 
                      : "justify-start w-auto px-3 py-2"
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {item.name === t("member") && <User size={16} />}
                    {item.name}
                  </span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className={`w-full ${isMobile ? "min-w-[200px]" : "md:w-56"}`}
                align={isMobile ? "start" : section === 'right' ? "end" : "start"}
              >
                {item.subLinks.map((sub) => (
                  item.id === "language" ? (
                    <DropdownMenuItem
                      key={sub.id}
                      className="text-sm cursor-pointer hover:bg-accent"
                      onClick={() => changeLanguage(sub.id === "lang-en" ? "en" : "th")}
                    >
                      {sub.name}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem key={sub.id} asChild>
                      <Link
                        href={sub.link || "#"}
                        className="text-sm w-full hover:bg-accent"
                        onClick={onCloseMenu}
                        target={sub.link?.startsWith("http") ? "_blank" : undefined}
                        rel={sub.link?.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {sub.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href={item.link || "#"}
              className={`
                flex items-center gap-2 text-sm lg:text-base hover:bg-accent rounded-md transition-colors
                ${isMobile 
                  ? "w-full px-3 py-2 h-10" 
                  : "px-3 py-2"
                }
              `}
              onClick={onCloseMenu}
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}