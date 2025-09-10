// app/docs/page.tsx
import type { Metadata } from "next";
import DocsLandingPage from "./DocsLandingPage";

export const metadata: Metadata = {
  title: "Welcome to - Chanomhub Docs",
  description: "Official documentation and guides for using Chanomhub - a tool designed to help you work more efficiently.",
};

export default function DocsPage() {
  return <DocsLandingPage />;
}