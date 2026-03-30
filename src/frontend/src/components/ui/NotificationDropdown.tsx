import { Bell, CheckCheck, X } from "lucide-react";
import { useState } from "react";
import { notifications as initialNotifications } from "../../data/dummyData";

type Notification = (typeof initialNotifications)[number];

const typeColors: Record<string, string> = {
  success: "#4ade80",
  info: "#60a5fa",
  warning: "#fbbf24",
  error: "#f87171",
};

const typeLabels: Record<string, string> = {
  success: "Success",
  info: "Info",
  warning: "Reminder",
  error: "Alert",
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(() =>
    initialNotifications.map((n) => ({ ...n })),
  );
  const [selected, setSelected] = useState<Notification | null>(null);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClickNotification = (n: Notification) => {
    setItems((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)),
    );
    setSelected({ ...n, read: true });
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setSelected(null);
        }}
        className="relative p-2 rounded-xl text-[#cccccc] hover:text-[#f9a8c9] hover:bg-[rgba(249,168,201,0.1)] transition-all"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#f9a8c9] text-black text-[9px] flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop — z-[9998] ensures it covers all other page elements */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={handleClose}
            onKeyDown={(e) => e.key === "Escape" && handleClose()}
            role="button"
            tabIndex={-1}
            aria-label="Close notifications"
          />

          {/* Panel — z-[9999] keeps it on top of the backdrop */}
          <div
            className="absolute right-0 top-full mt-2 w-80 z-[9999] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "#111111",
              border: "1px solid rgba(249,168,201,0.25)",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(249,168,201,0.1)",
            }}
          >
            {selected ? (
              /* Detail view */
              <div>
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-[#888] hover:text-white transition-colors text-xs flex items-center gap-1"
                  >
                    ← Back
                  </button>
                  <span className="text-sm font-semibold text-white ml-auto">
                    Notification Detail
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: typeColors[selected.type] }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        background: `${typeColors[selected.type]}22`,
                        color: typeColors[selected.type],
                      }}
                    >
                      {typeLabels[selected.type]}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {selected.title}
                  </h3>
                  <p className="text-sm text-[#cccccc] leading-relaxed mb-4">
                    {selected.message}
                  </p>
                  <p className="text-[11px] text-[#666]">{selected.time}</p>
                </div>
              </div>
            ) : (
              /* List view */
              <>
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Notifications
                    </h3>
                    <p className="text-[11px] text-[#f9a8c9] mt-0.5">
                      {unread > 0 ? `${unread} unread` : "All caught up"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="p-1.5 rounded-lg text-[#888] hover:text-[#f9a8c9] hover:bg-[rgba(249,168,201,0.1)] transition-all"
                        title="Mark all as read"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto">
                  {items.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="w-full text-left px-4 py-3 transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: !n.read
                          ? "rgba(249,168,201,0.04)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(249,168,201,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = !n.read
                          ? "rgba(249,168,201,0.04)"
                          : "transparent";
                      }}
                      onClick={() => handleClickNotification(n)}
                    >
                      <div className="flex gap-3 items-start">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: typeColors[n.type] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-semibold ${!n.read ? "text-white" : "text-[#aaaaaa]"}`}
                          >
                            {n.title}
                          </p>
                          <p className="text-[11px] text-[#888] mt-0.5 truncate">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-[#555] mt-1">
                            {n.time}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#f9a8c9] flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="px-4 py-3 text-center"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span className="text-[11px] text-[#555]">
                    Click a notification to view details
                  </span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
