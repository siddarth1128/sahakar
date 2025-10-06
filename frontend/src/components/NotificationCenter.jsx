import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useSocket } from "../context/SocketProvider";
import { toast } from "sonner";

export default function NotificationCenter() {
  const { socket, connected } = useSocket();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const unread = useMemo(() => items.filter(i => !i.read).length, [items]);

  useEffect(() => {
    if (!socket) return;
    const onNotify = (payload) => {
      const note = {
        id: payload?.id || Date.now(),
        title: payload?.title || 'Notification',
        message: payload?.message || '',
        time: payload?.time || new Date().toLocaleTimeString(),
        type: payload?.type || 'info',
        read: false,
      };
      setItems(prev => [note, ...prev].slice(0, 50));
      // surface via toast too
      const fn = note.type === 'error' ? toast.error : note.type === 'success' ? toast.success : toast;
      fn(`${note.title}${note.message ? `: ${note.message}` : ''}`);
    };
    socket.on('notification:new', onNotify);
    return () => socket.off('notification:new', onNotify);
  }, [socket]);

  return (
    <div className="relative">
      <button
        className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10"
        aria-label="Notifications"
        onClick={() => setOpen(o => !o)}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] leading-none bg-red-500 text-white rounded-full px-1.5 py-0.5">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-white text-slate-900 shadow-lg z-50">
          <div className="p-2 border-b font-semibold">Notifications</div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">No notifications</div>
            ) : items.map((n) => (
              <div key={n.id} className={`p-3 text-sm border-b ${n.read ? '' : 'bg-slate-50'}`} onMouseEnter={() => setItems(prev => prev.map(i => i.id === n.id ? { ...i, read: true } : i))}>
                <div className="font-medium">{n.title}</div>
                {n.message ? <div className="text-slate-600 mt-0.5">{n.message}</div> : null}
                <div className="text-[11px] text-slate-400 mt-1">{n.time}</div>
              </div>
            ))}
          </div>
          <div className="p-2 text-right">
            <button className="text-xs text-slate-500 hover:text-slate-700" onClick={() => setItems(prev => prev.map(i => ({ ...i, read: true })))}>Mark all as read</button>
          </div>
        </div>
      )}
    </div>
  );
}
