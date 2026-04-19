"use client";
import { Link } from "@/i18n/navigation";
import { Heart, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DonationCTA() {
  const t = useTranslations("DonationCTA");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 mb-6 group">
      {/* Decorative background element */}
      <div className="absolute -right-8 -top-8 text-primary/5 group-hover:text-primary/10 transition-colors duration-500">
        <Heart className="h-32 w-32 fill-current" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Heart className="h-6 w-6 fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{t("title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/donations"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 gap-2"
          >
            {t("supportUs")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/donations"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          >
            {t("viewSupporters")}
          </Link>
        </div>
      </div>
    </div>
  );
}
