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
    dockPosition: 'right',
    isExpanded: false,
  });

  // Route-specific styles for the main content container
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

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "xl:ml-[290px]"
    : "xl:ml-[90px]";

  const getChatMargin = () => {
    const isDocked = chatState.mode === 'docked' && chatState.isExpanded
    if (!isDocked) return {}

    switch (chatState.dockPosition) {
      case 'left':
        return { marginLeft: '384px' }
      case 'right':
        return { marginRight: '384px' }
      case 'bottom':
        return { marginBottom: '384px' }
      default:
        return {}
    }
  }

  const isFullscreen = chatState.mode === 'fullscreen'
  const isDocked = chatState.mode === 'docked' && chatState.isExpanded
  const isMinimizedOrFloating = chatState.mode === 'minimized' || chatState.mode === 'floating'

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

      {/* OmniChat - positioned in flex when docked, fixed when minimized/floating */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isDocked
            ? chatState.dockPosition === 'bottom'
              ? 'w-full'
              : 'w-96'
            : ''
        }`}
        style={{
          display: isDocked ? 'block' : 'none',
        }}
      >
        <OmniChat
          initialMode="minimized"
          initialDockPosition="right"
          onStateChange={setChatState}
        />
      </div>

      {/* OmniChat for minimized/floating modes */}
      {isMinimizedOrFloating && (
        <OmniChat
          initialMode="minimized"
          initialDockPosition="right"
          onStateChange={setChatState}
        />
      )}
    </div>
  );
}
