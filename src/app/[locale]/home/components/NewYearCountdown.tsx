'use client';

import { useEffect, useState } from 'react';

export default function NewYearCountdown() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const currentYear = now.getFullYear();

            // Target: January 1st of next year
            const targetDate = new Date(currentYear + 1, 0, 1); // Month 0 = January

            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        // Calculate immediately
        calculateTimeLeft();

        // Update every second
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline text-muted-foreground">🎉 New Year Countdown:</span>
            <div className="flex items-center gap-1 font-mono font-semibold">
                <div className="flex flex-col items-center">
                    <span className="text-primary">{timeLeft.days}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">วัน</span>
                </div>
                <span className="text-muted-foreground">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-primary">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">ชม.</span>
                </div>
                <span className="text-muted-foreground">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-primary">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">นาที</span>
                </div>
                <span className="text-muted-foreground">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">วิ</span>
                </div>
            </div>
            <span className="hidden sm:inline">🎆</span>
        </div>
    );
}
