
"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect, useRef } from "react"; // Added useRef
import { useAppDispatch } from "./hooks";
import { fetchUser, initializeAuth } from "./features/auth/authSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            // Load from local storage first for optimistic UI (optional, but good for UX)
            dispatch(initializeAuth());
            // Then fetch fresh data from server
            dispatch(fetchUser());
        }
    }, [dispatch]);

    return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AuthInitializer>
                {children}
            </AuthInitializer>
        </Provider>
    );
}
