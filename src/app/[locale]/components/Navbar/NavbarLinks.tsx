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
  onCloseMenu?: () => void;
}

export default function NavbarLinks({ onCloseMenu = () => {} }: NavbarLinksProps) {
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
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

    const baseLinks: NavLink[] = [
      { id: "3", name: t("search"), transKey: "search", link: getLocalizedHref("/search") },
      {
        id: "2",
        name: t("extensions"),
        transKey: "extensions",
        subLinks: [
          { id: "2-1", name: t("loadApp"), transKey: "loadApp", link: getLocalizedHref("/application") },
          {
            id: "2-2",
            name: t("webStatus"),
            transKey: "webStatus",
            link: "https://status.chanomhub.online/status/all",
          },
        ],
      },
      {
        id: "5-lang",
        name: t("language"),
        transKey: "language",
        subLinks: [
          { id: "5-1", name: t("english"), transKey: "english", link: "#" },
          { id: "5-2", name: t("thai"), transKey: "thai", link: "#" },
        ],
      },
    ];

    if (token) {
      setNavLinks([
        ...baseLinks,
        {
          id: "4-member",
          name: t("member"),
          transKey: "member",
          subLinks: [
            { id: "4-1", name: t("dashboard"), transKey: "dashboard", link: getLocalizedHref("/member/dashboard") },
            { id: "4-2", name: t("profile"), transKey: "profile", link: getLocalizedHref("/member/profile") },
            { id: "4-3", name: t("settings"), transKey: "settings", link: getLocalizedHref("/member/settings") },
            { id: "4-4", name: t("contact"), transKey: "contact", link: getLocalizedHref("/contact") },
            { id: "4-5", name: t("logout"), transKey: "logout", link: getLocalizedHref("/logout") },
          ],
        },
      ]);
    } else {
      setNavLinks(baseLinks);
    }
  }, [isClient, locale, pathname, t, getLocalizedHref]);

  if (!isClient) {
    return <div className="flex flex-col md:flex-row md:items-center md:gap-4 space-y-2 md:space-y-0" />;
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-4 space-y-2 md:space-y-0">
      {navLinks.map((item) => (
        <div key={item.id} className="w-full md:w-auto">
          {item.subLinks ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center justify-between md:justify-start w-full md:w-auto gap-2 text-sm lg:text-base hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    {item.name === t("member") && <User size={16} className="mr-1" />}
                    {item.name}
                  </span>
                  <ChevronDown size={16} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full md:w-56">
                {item.subLinks.map((sub) => (
                  item.id === "5-lang" ? (
                    <DropdownMenuItem
                      key={sub.id}
                      className="text-sm cursor-pointer hover:bg-accent"
                      onClick={() => changeLanguage(sub.id === "5-1" ? "en" : "th")}
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
              className="flex items-center gap-2 px-4 py-2 text-sm lg:text-base hover:bg-accent rounded-md w-full md:w-auto"
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
