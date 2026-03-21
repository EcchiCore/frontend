"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCookies } from "react-cookie";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CookieConsent() {
    const t = useTranslations("CookieConsent");
    const [cookies, setCookie] = useCookies(["cookie-consent"]);
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Check if the user has already consented
        if (!cookies["cookie-consent"]) {
            // Delay slightly to show animation
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [cookies]);

    // Hide on privacy policy page to avoid clutter
    if (pathname?.includes("/privacy-policy")) {
        return null;
    }

    const handleAccept = () => {
        setCookie("cookie-consent", "true", { path: "/", maxAge: 31536000 }); // 1 year
        setIsVisible(false);
    };

    const handleDecline = () => {
        // Even if declined, we might simple hide it or set a "false" cookie.
        // For now, let's set a strictly necessary only flag or similar if logic existed,
        // but standard "Decline" often just closes banner or sets a reject cookie.
        // Here we'll set a 'false' value to remember the choice.
        setCookie("cookie-consent", "false", { path: "/", maxAge: 31536000 });
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
                >
                    <Card className="border-primary/20 bg-background/95 backdrop-blur-md shadow-2xl">
                        <CardHeader className="flex flex-row items-center gap-2 pb-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Cookie className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-bold">{t("title")}</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={handleDecline}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <CardDescription className="text-sm font-medium text-muted-foreground">
                                {t("description")}
                            </CardDescription>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-0">
                            <Button variant="outline" size="sm" onClick={handleDecline}>
                                {t("decline")}
                            </Button>
                            <Button variant="default" size="sm" onClick={handleAccept}>
                                {t("accept")}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
