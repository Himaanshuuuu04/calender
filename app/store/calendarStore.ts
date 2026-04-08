import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FastAverageColor } from "fast-average-color";
import chroma from "chroma-js";
import { addMonths, subMonths } from "date-fns";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
};

export type CalendarTheme = {
  accent: string;
  text: string;
  highlight: string;
  highlightBg: string;
};

const IMAGES = [
  // Q1: Minimalist & Fresh (Jan - Mar)
  "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=2000&auto=format&fit=crop", // Soft blue frost
  "https://images.unsplash.com/photo-1491466424936-e304919aada7?q=80&w=2000&auto=format&fit=crop", // Clean mountain peak
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop", // Crisp spring ridges

  // Q2: Vibrant & Open (Apr - Jun)
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop", // Sun-dappled woods
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop", // Misty meadow
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000&auto=format&fit=crop", // Calm lake (high negative space)

  // Q3: Warm & Expansive (Jul - Sep)
  "https://images.unsplash.com/photo-1494548162494-384bba4ab999?q=80&w=2000&auto=format&fit=crop", // Golden hour horizon
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2000&auto=format&fit=crop", // Minimalist green hill
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=2000&auto=format&fit=crop", // Soft waterfall

  // Q4: Muted & Moody (Oct - Dec)
  "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=2000&auto=format&fit=crop", // Moody path
  "https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?q=80&w=2000&auto=format&fit=crop", // Deep evergreen
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop", // Abstract digital (neutral end)
];
interface CalendarState {
  currentDateStr: string;
  startDateStr: string | null;
  endDateStr: string | null;
  hoverDateStr: string | null;

  monthNotes: Record<string, string>;
  events: CalendarEvent[];
  dateNotes: Record<string, string>;

  theme: CalendarTheme;
  isDetailsModalOpen: boolean;
  soundEnabled: boolean;
  hasVisited: boolean;

  // Actions
  nextMonth: () => void;
  prevMonth: () => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setHoverDate: (date: Date | null) => void;
  setMonthNote: (key: string, note: string) => void;
  addEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  setDateNote: (key: string, note: string) => void;
  setModalOpen: (isOpen: boolean) => void;
  toggleSound: () => void;
  setHasVisited: () => void;
  setCurrentDate: (dateStr: string) => void;
  extractTheme: () => Promise<void>;
  getImageForMonth: (dateStr?: string) => string;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      // fixed date for hydration match
      currentDateStr: "2026-04-08T12:00:00.000Z",
      startDateStr: null,
      endDateStr: null,
      hoverDateStr: null,

      monthNotes: {},
      events: [],
      dateNotes: {},

      theme: {
        accent: "#00B5AD",
        text: "#1D3D60",
        highlight: "#D32F2F",
        highlightBg: "#fef2f2",
      },
      isDetailsModalOpen: false,
      soundEnabled: true,
      hasVisited: false,

      // Actions
      nextMonth: () => {
        set((state) => ({
          currentDateStr: addMonths(
            new Date(state.currentDateStr),
            1,
          ).toISOString(),
        }));
        get().extractTheme();
      },
      prevMonth: () => {
        set((state) => ({
          currentDateStr: subMonths(
            new Date(state.currentDateStr),
            1,
          ).toISOString(),
        }));
        get().extractTheme();
      },
      setStartDate: (date) =>
        set({ startDateStr: date ? date.toISOString() : null }),
      setEndDate: (date) =>
        set({ endDateStr: date ? date.toISOString() : null }),
      setHoverDate: (date) =>
        set({ hoverDateStr: date ? date.toISOString() : null }),

      setMonthNote: (key, note) =>
        set((state) => ({
          monthNotes: { ...state.monthNotes, [key]: note },
        })),

      addEvent: (event) =>
        set((state) => ({ events: [...state.events, event] })),
      deleteEvent: (id) =>
        set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      setDateNote: (key, note) =>
        set((state) => ({
          dateNotes: { ...state.dateNotes, [key]: note },
        })),

      setModalOpen: (isOpen) => set({ isDetailsModalOpen: isOpen }),

      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),

      setHasVisited: () => set({ hasVisited: true }),

      setCurrentDate: (dateStr) => set({ currentDateStr: dateStr }),

      getImageForCurrentMonth: () => {
        const date = new Date(get().currentDateStr);
        return IMAGES[date.getMonth()];
      },

      getImageForMonth: (dateStr?: string) => {
        const date = new Date(dateStr || get().currentDateStr);
        return IMAGES[date.getMonth()];
      },

      extractTheme: async () => {
        try {
          const imgUrl = get().getImageForMonth();
          const fac = new FastAverageColor();
          const color = await fac.getColorAsync(imgUrl, {
            crossOrigin: "anonymous",
          });
          const base = chroma(color.hex);

          set({
            theme: {
              accent: base.saturate(1).hex(),
              text: base.darken(3).desaturate(1).hex(),
              highlight: base
                .set("hsl.h", "+120")
                .saturate(2)
                .darken(0.5)
                .hex(),
              highlightBg: base
                .set("hsl.h", "+120")
                .desaturate(1)
                .brighten(3)
                .hex(),
            },
          });
        } catch (err) {
          console.error("Failed to extract theme color automatically:", err);
        }
      },
    }),
    {
      name: "calendar-storage", // local storage key
      skipHydration: true,
      partialize: (state) => ({
        monthNotes: state.monthNotes,
        events: state.events,
        dateNotes: state.dateNotes,
        theme: state.theme,
        currentDateStr: state.currentDateStr,
        soundEnabled: state.soundEnabled,
        hasVisited: state.hasVisited,
      }), // only persist these fields
    },
  ),
);
