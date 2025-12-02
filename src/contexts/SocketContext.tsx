// src/contexts/SocketContext.tsx หรือ src/providers/SocketProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { jwtDecode } from "jwt-decode";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const token = typeof window !== "undefined" ? Cookies.get("token") : null;

    useEffect(() => {
        // ถ้ายังไม่มี token → disconnect
        if (!token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // ถ้าเชื่อมต่ออยู่แล้ว → ไม่ต้องทำอะไร
        if (socketRef.current?.connected) {
            return;
        }

        // ดึง userId จาก JWT
        let userId: string | undefined;
        try {
            const decoded: any = jwtDecode(token);
            userId = (decoded.id || decoded.sub || decoded.userId)?.toString();
        } catch (e) {
            console.error("Failed to decode JWT for socket", e);
        }

        if (!userId) {
            toast.error("ไม่สามารถเชื่อมต่อแจ้งเตือนได้ (userId not found)");
            return;
        }

        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        const newSocket = io(url, {
            path: "/notifications",           // ต้องตรงกับ backend
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            query: { userId },
            auth: { token },
        });

        newSocket.on("connect", () => {
            console.log("WebSocket connected:", newSocket.id);
            setIsConnected(true);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("WebSocket disconnected:", reason);
            setIsConnected(false);
        });

        newSocket.on("notification", (data: any) => {
            toast.info(data.message || "มีแจ้งเตือนใหม่", {
                description: data.description,
                duration: 6000,
            });
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token]); // re-run เมื่อ token เปลี่ยน

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};