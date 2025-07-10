"use client";
import { useState, useEffect, useRef, useCallback } from "react"; // Add useCallback
import Link from "next/link";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import Cookies from "js-cookie";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface NavLink {
  id: string;
  name: string;
  transKey?: string;
  link?: string;
  subLinks?: NavLink[];
}

interface NavbarLinksProps {
  onCloseMenu?: () => void;
  theme?: string;
}

export default function NavbarLinks({ onCloseMenu = () => {} }: NavbarLinksProps) {
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navbar");

  // Get current locale from URL
  const locale = (params?.locale as string) || "th";

  // Memoize getLocalizedHref to prevent recreation on every render
  const getLocalizedHref = useCallback(
    (path: string, targetLocale?: string) => {
      if (path.startsWith("http")) return path; // External links stay as is
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
    [locale], // Dependency: locale
  );

  const toggleSubmenu = (id: string) => {
    setOpenSubmenu((prev) => (prev === id ? null : id));
  };

  const changeLanguage = (lang: string) => {
    let targetPath = pathname || "";
    if (pathname && pathname.startsWith(`/${locale}/`)) {
      targetPath = pathname.substring(locale.length + 2);
    } else if (pathname === `/${locale}`) {
      targetPath = "/";
    }
    const newPath = getLocalizedHref(targetPath, lang);
    router.push(newPath);
    onCloseMenu();
  };

  // Generate navigation links based on authentication status
  useEffect(() => {
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
  }, [locale, pathname, t, getLocalizedHref]);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-4 lg:gap-6 space-y-2 md:space-y-0">
      {navLinks.map((item) => (
        <div
          key={item.id}
          ref={(el) => {
            menuRefs.current[item.id] = el;
          }}
          className="relative w-full md:w-auto whitespace-nowrap"
        >
          {item.subLinks ? (
            <div className="w-full">
              <button
                onClick={() => toggleSubmenu(item.id)}
                className={`flex items-center justify-between md:justify-start w-full md:w-auto gap-2 px-4 py-2 rounded-lg
                  text-sm lg:text-base whitespace-nowrap
                  hover:bg-base-200 hover:text-base-content transition duration-200`}
              >
                <span className="flex items-center gap-2">
                  {item.name === t("member") && <User size={16} className="mr-1" />}
                  {item.name}
                </span>
                {openSubmenu === item.id ? (
                  <ChevronUp size={16} className="ml-1" />
                ) : (
                  <ChevronDown size={16} className="ml-1" />
                )}
              </button>
              {openSubmenu === item.id && (
                <div className="w-full md:absolute md:left-0 md:mt-2 pl-4 md:pl-0 space-y-2 bg-base-200 md:shadow rounded-box md:p-3 z-[1000]">
                  {item.subLinks.map((sub) => (
                    item.id === "5-lang" ? (
                      <button
                        key={sub.id}
                        className="block w-full text-left px-4 py-2 rounded-lg text-sm whitespace-nowrap
                          hover:bg-base-300
                          transition duration-150 ease-in-out"
                        onClick={() => changeLanguage(sub.id === "5-1" ? "en" : "th")}
                      >
                        {sub.name}
                      </button>
                    ) : (
                      <Link
                        key={sub.id}
                        href={sub.link || "#"}
                        className="block w-full px-4 py-2 rounded-lg text-sm whitespace-nowrap
                          hover:bg-base-300
                          transition duration-150 ease-in-out"
                        onClick={onCloseMenu}
                      >
                        {sub.name}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              href={item.link || "#"}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg
                text-sm lg:text-base whitespace-nowrap
                w-full md:w-auto
                hover:bg-base-200 hover:text-base-content transition duration-200`}
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