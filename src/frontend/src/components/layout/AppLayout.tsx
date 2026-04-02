import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import FloatingChatbot from "../ui/FloatingChatbot";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex overflow-hidden bg-app" style={{ height: "100dvh" }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="relative flex flex-col flex-1 min-w-0">
        <TopBar />
        <main
          className="flex-1 p-6"
          style={{
            overflowY: "auto",
            WebkitOverflowScrolling: "touch" as any,
          }}
        >
          <Outlet />
        </main>
        <FloatingChatbot />
      </div>
    </div>
  );
}
