// components/ErrorCard.tsx
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ErrorCard({ locale }: ErrorCardProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-destructive">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="text-destructive">
            {locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error Occurred'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {locale === 'th'
              ? 'เกิดข้อผิดพลาดในการโหลดบทความ กรุณาลองใหม่ภายหลัง'
              : 'Error loading articles. Please try again later.'
            }
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => window.location.reload()}
          >
            {locale === 'th' ? 'ลองใหม่' : 'Try Again'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}