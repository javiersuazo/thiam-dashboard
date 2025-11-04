"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { OmniChat, type ChatStateInfo } from "@/components/domains/omni-chat";

/**
 * Admin Layout Client Component
 *
 * Handles client-side UI state and interactivity.
 * Authentication is enforced in the parent server component.
 */
export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const [chatState, setChatState] = useState<ChatStateInfo>({
    mode: 'minimized',
    isExpanded: false,
  });

  const getRouteSpecificStyles = () => {
    switch (pathname) {
      case "/text-generator":
        return "";
      case "/code-generator":
        return "";
      case "/image-generator":
        return "";
      case "/video-generator":
        return "";
      default:
        return "p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6";
    }
  };

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "xl:ml-[290px]"
    : "xl:ml-[90px]";

  const isFullscreen = chatState.mode === 'fullscreen'

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        style={{
          display: isFullscreen ? 'none' : undefined,
        }}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className={getRouteSpecificStyles()}>{children}</div>
      </div>

      <OmniChat
        initialMode="minimized"
        onStateChange={setChatState}
      />
    </div>
  );
}
