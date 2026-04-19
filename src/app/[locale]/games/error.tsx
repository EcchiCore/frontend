"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("ErrorPage")
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="bg-destructive/10 p-8 rounded-3xl inline-block border border-destructive/20">
            <AlertCircle className="w-20 h-20 text-destructive" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground">{t("title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{error.message || t("defaultMessage")}</p>
          </div>
          <Button onClick={reset} size="lg" className="px-8 shadow-lg shadow-primary/20">
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    </div>
  )
}
