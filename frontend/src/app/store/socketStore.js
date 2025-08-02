import { create } from "zustand";
// import { atom, useAtom } from 'jotai';

// const countAtom = atom(0);

export const useSocketStore = create((set, get) => ({
    socket: null,
    messages: [],

    connect: () => {
        const existingSocket = get().socket;
        if (existingSocket && existingSocket.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket("ws://localhost:8080/ws");

        ws.onopen = () => {
        console.log("✅ WebSocket connected");
        };

        ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        console.log("📩 Received:", msg);
        set((state) => ({ messages: [...state.messages, msg] }));
        };

        ws.onclose = () => {
        console.log("❌ WebSocket disconnected");
        set({ socket: null });
        };

        ws.onerror = (e) => console.error("⚠️ WebSocket error:", e);

        set({ socket: ws });
    },

    sendMessage: (data) => {
        const socket = get().socket;
        if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        } else {
        console.warn("⚠️ WebSocket not connected");
        }
    },

    close: () => {
        const socket = get().socket;
        if (socket) {
        socket.close();
        set({ socket: null });
        }
    },
}));
