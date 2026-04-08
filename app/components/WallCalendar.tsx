"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CalendarImage from "./calendar/CalendarImage";
import CalendarGrid from "./calendar/CalendarGrid";
import CalendarNotes from "./calendar/CalendarNotes";
import CalendarModal from "./calendar/CalendarModal";
import CalendarFlipper from "./calendar/CalendarFlipper";
import { useCalendarStore } from "../store/calendarStore";

export default function WallCalendar() {
  const [hydrated, setHydrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, currentDateStr, soundEnabled, toggleSound } =
    useCalendarStore();

  useEffect(() => {
    // Ensuring Zustand persistence only renders client-side to prevent hydration mismatch
    setTimeout(() => setHydrated(true), 0);
  }, []);

  if (!hydrated) return null;

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-gray-300 py-10 flex items-center justify-center font-sans relative transition-colors duration-500"
      style={
        {
          "--theme-accent": theme.accent,
          "--theme-text": theme.text,
          "--theme-highlight": theme.highlight,
          "--theme-highlight-bg": theme.highlightBg,
        } as React.CSSProperties
      }
    >
      {/* Wall Texture Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply opacity-40"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/wall-4-light.png')",
        }}
      ></div>

      <CalendarModal />

      <CalendarFlipper
        renderPage={(dateStr) => (
          <div className="cal-container">
            <div
              className="absolute inset-0 z-50 pointer-events-none mix-blend-multiply opacity-60"
              style={{
                backgroundImage: "url('/watercolor-paper-texture.webp')",
                backgroundSize: "cover",
              }}
            ></div>

            <CalendarImage overrideDateStr={dateStr} />

            <div className="cal-section-right">
              <CalendarGrid overrideDateStr={dateStr} />
              <CalendarNotes overrideDateStr={dateStr} />
            </div>
          </div>
        )}
      />

      {/* Floating Sound Toggle */}
      <button
        onClick={toggleSound}
        className="fixed bottom-6 right-6 z-50 bg-theme-accent text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
        title={soundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {soundEnabled ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

