// File: app/[locale]/ad-redirect/page.tsx
import React, { Suspense } from 'react';
import AdRedirectContent from "./AdRedirectContent";
import {getTranslations} from "next-intl/server";


export default async function Page() {
  const t = await getTranslations("ad-redirect")
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-base-200 flex justify-center items-center p-4">
          <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-center text-2xl font-bold">{t("Loading")}</h2>
              <div className="my-6 flex justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AdRedirectContent />
    </Suspense>
  );
}