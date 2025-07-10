"use client";

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export default function ThemeManager() {
  const [cookies] = useCookies(["theme", "fontSize"]);
  const [, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const savedTheme = cookies.theme || "dark";
    const savedFontSize = cookies.fontSize || "medium";

    // Apply theme
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Apply font size
    let rootSize = "16px";
    switch (savedFontSize) {
      case "small":
        rootSize = "14px";
        break;
      case "large":
        rootSize = "18px";
        break;
      case "xlarge":
        rootSize = "20px";
        break;
    }
    document.documentElement.style.fontSize = rootSize;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        document.documentElement.setAttribute("data-theme", e.newValue || "dark");
      }
      if (e.key === "fontSize") {
        let newSize = "16px";
        switch (e.newValue) {
          case "small":
            newSize = "14px";
            break;
          case "large":
            newSize = "18px";
            break;
          case "xlarge":
            newSize = "20px";
            break;
        }
        document.documentElement.style.fontSize = newSize;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [cookies.theme, cookies.fontSize]);

  return null; // This component doesn't render anything
}
