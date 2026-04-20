'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ChristmasCountdown() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const t = useTranslations('ChristmasCountdown');

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            let targetDate = new Date(now.getFullYear(), 11, 1);
            if (now > targetDate) targetDate = new Date(now.getFullYear() + 1, 11, 1);
            
            const diff = targetDate.getTime() - now.getTime();

            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / 86400000),
                    hours: Math.floor((diff / 3600000) % 24),
                    minutes: Math.floor((diff / 60000) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 text-xs" suppressHydrationWarning>
            <span className="hidden sm:inline text-muted-foreground">🎄 Christmas Countdown:</span>
            <div className="flex items-center gap-1 font-mono font-semibold">
                <div className="flex flex-col items-center">
                    <span className="text-primary">{timeLeft.days}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">{t('days')}</span>
                </div>
                <span className="text-muted-foreground">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-primary">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">{t('hours')}</span>
                </div>
                <span className="text-muted-foreground">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-primary">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">{t('minutes')}</span>
                </div>
                <span className="text-muted-foreground">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">{t('seconds')}</span>
                </div>
            </div>
            <span className="hidden sm:inline">🎅</span>
        </div>
    );
}
