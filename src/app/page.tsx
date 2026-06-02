// app/page.tsx
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { defaultLocale } from "@/utils/localeUtils";

// List of common bot/crawler user-agent substrings (case-insensitive)
const BOT_USER_AGENTS = [
  "googlebot",
  "bingbot",
  "yandex",
  "baiduspider",
  "duckduckbot",
  "yahoo",
  "slurp",
  "sogou",
  "exabot",
  "ia_archiver",
  "applebot",
  "facebot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "telegrambot",
  "whatsapp",
  "discordbot",
];

export default async function RootPage() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent")?.toLowerCase() || "";
  // 1. Check if the visitor is a verified bot via Cloudflare or standard User-Agent
  const isCfVerifiedBot = headersList.get("cf-verified-bot") === "true";
  const isUserAgentBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));
  const isBot = isCfVerifiedBot || isUserAgentBot;

  if (!isBot) {
    // 2. Prioritize User Preference Cookie (if user previously selected a language)
    const cookieStore = await cookies();
    const preferredLocale = cookieStore.get("NEXT_LOCALE")?.value;

    if (preferredLocale === "th" || preferredLocale === "en") {
      redirect(`/${preferredLocale}`);
    }

    // 3. Fallback to Cloudflare IP-based Country Detection (First-time real users)
    const country = headersList.get("cf-ipcountry");
    if (country === "TH") {
      redirect("/th");
    }
  }

  // 4. Default fallback redirect (including all bots/crawlers)
  redirect(`/${defaultLocale}`);
}
