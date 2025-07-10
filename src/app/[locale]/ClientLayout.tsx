"use client";

import { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";
import ThemeManager from "./theme-manager";

// Mock only; replace with your actual import
const IntlayerProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <CookiesProvider>
      <IntlayerProvider>
        <ThemeManager />
        {children}
      </IntlayerProvider>
    </CookiesProvider>
  );
}
