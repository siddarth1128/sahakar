import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import { API_BASE } from "../lib/api";

const SocketCtx = createContext(null);

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io(API_BASE, {
      autoConnect: true,
      transports: ["websocket"],
      withCredentials: true,
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Optional: identify after connect (role-aware on server)
    if (token) socket.emit("identify", { token });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, []);

  const value = useMemo(() => ({ socket: socketRef.current, connected }), [connected]);

  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>;
}

export function useSocket() {
  return useContext(SocketCtx) || { socket: null, connected: false };
}
