"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="bg-destructive/10 p-8 rounded-3xl inline-block border border-destructive/20">
            <AlertCircle className="w-20 h-20 text-destructive" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground">เกิดข้อผิดพลาด</h2>
            <p className="text-muted-foreground leading-relaxed">{error.message || "ไม่สามารถโหลดข้อมูลได้ในขณะนี้"}</p>
          </div>
          <Button onClick={reset} size="lg" className="px-8 shadow-lg shadow-primary/20">
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      </div>
    </div>
  )
}
