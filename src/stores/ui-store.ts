/**
 * UI Store - Global UI state management with Zustand
 */

import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  impersonationBannerVisible: boolean
  setImpersonationBannerVisible: (visible: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  impersonationBannerVisible: true,
  setImpersonationBannerVisible: (visible) =>
    set({ impersonationBannerVisible: visible }),
}))
