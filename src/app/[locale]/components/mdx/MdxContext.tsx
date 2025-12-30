"use client";

import { createContext, useContext, type ReactNode } from "react";

interface MdxContextValue {
    locale: string;
}

const MdxContext = createContext<MdxContextValue>({ locale: "th" });

export function MdxProvider({
    children,
    locale,
}: {
    children: ReactNode;
    locale: string;
}) {
    return (
        <MdxContext.Provider value={{ locale }}>{children}</MdxContext.Provider>
    );
}

export function useMdxContext() {
    return useContext(MdxContext);
}
