// File: app/[locale]/ad-redirect/page.tsx
import React, { Suspense } from 'react';
import AdRedirectContent from "./AdRedirectContent";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {getTranslations} from "next-intl/server";


export default async function Page() {
  const t = await getTranslations("ad-redirect")
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex justify-center items-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">{t("Loading")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="my-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AdRedirectContent />
    </Suspense>
  );
}