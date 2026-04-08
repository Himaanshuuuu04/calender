import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { addMonths, subMonths } from "date-fns";
import { useCalendarStore } from "../../store/calendarStore";

function TopBinding() {
  const loopCount = 38;
  return (
    <div className="absolute top-[-22px] left-0 w-full z-[100] pointer-events-none drop-shadow-xl flex flex-col items-center">
      <svg
        width="94%"
        height="40"
        viewBox="0 0 1000 40"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <path
          d="M 0 25 L 460 25 C 480 25, 490 0, 500 0 C 510 0, 520 25, 540 25 L 1000 25"
          fill="none"
          stroke="url(#wireGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="wireGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9ca3af" />
            <stop offset="50%" stopColor="#4b5563" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute top-[20px] w-[94%] flex justify-between px-2">
        {Array.from({ length: loopCount }).map((_, i) => {
          const isCenter = Math.abs(i - loopCount / 2) < 1.5;
          if (isCenter)
            return <div key={i} className="w-[10px] h-[30px] opacity-0" />;
          return (
            <div
              key={i}
              className="w-[8px] h-[26px] bg-gradient-to-r from-gray-300 via-gray-500 to-gray-800 rounded-[4px] shadow-[2px_2px_4px_rgba(0,0,0,0.6)]"
            ></div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarHoles() {
  const loopCount = 38;
  return (
    <div className="absolute top-[6px] w-[94%] left-[3%] flex justify-between px-2 z-[60] pointer-events-none">
      {Array.from({ length: loopCount }).map((_, i) => {
        const isCenter = Math.abs(i - loopCount / 2) < 1.5;
        if (isCenter) return <div key={i} className="w-[10px]" />;
        return (
          <div
            key={i}
            className="w-[8px] h-[10px] bg-gray-200 rounded-full shadow-[inset_0_3px_5px_rgba(0,0,0,0.5)]"
          ></div>
        );
      })}
    </div>
  );
}

export default function CalendarFlipper({
  renderPage,
}: {
  renderPage: (dateStr?: string) => React.ReactNode;
}) {
  const { nextMonth, prevMonth, currentDateStr, soundEnabled, toggleSound } =
    useCalendarStore();
  const [animatingDir, setAnimatingDir] = useState<number | null>(null);

  const topLayerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const breezeTween = useRef<gsap.core.Tween | null>(null);

  // Audio references
  const windAudioRef = useRef<HTMLAudioElement | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

  const prevMonthStr = subMonths(new Date(currentDateStr), 1).toISOString();
  const nextMonthStr = addMonths(new Date(currentDateStr), 1).toISOString();

  // Initialize audio elements on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      windAudioRef.current = new Audio("/wind_effect.mp3");
      windAudioRef.current.loop = true;
      windAudioRef.current.volume = 0.2; // subtle background

      flipAudioRef.current = new Audio("/page_flip.mp3");
      flipAudioRef.current.volume = 0.7; // louder for impact
    }

    return () => {
      windAudioRef.current?.pause();
      flipAudioRef.current?.pause();
    };
  }, []);

  // Control wind loop automatically based on idle state
  useEffect(() => {
    if (!windAudioRef.current) return;

    if (animatingDir === null && soundEnabled) {
      windAudioRef.current
        .play()
        .catch((e) =>
          console.log("Audio autoplay prevented - interaction required", e),
        );
    } else {
      windAudioRef.current.pause();
    }
  }, [animatingDir, soundEnabled]);

  // "Airy" breeze animation
  useEffect(() => {
    // Return early and kill if flipping
    if (animatingDir !== null || !topLayerRef.current) {
      if (breezeTween.current) breezeTween.current.kill();
      return;
    }

    gsap.set(topLayerRef.current, {
      transformPerspective: 1800,
      transformOrigin: "top center",
    });

    breezeTween.current = gsap.fromTo(
      topLayerRef.current,
      { rotationX: 0 },
      {
        rotationX: 6,
        duration: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        // Start animation a bit randomized or smoothly so it doesn't snap if it just finished a flip
      },
    );

    return () => {
      if (breezeTween.current) breezeTween.current.kill();
    };
  }, [animatingDir]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" ||
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON"
      ) {
        return; // Let them scroll the textarea
      }

      const scrollableContainer = target.closest(
        ".overflow-y-auto, .overflow-y-scroll",
      );
      if (scrollableContainer) {
        // Check if the container actually has scrollable content and is being scrolled
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;
        const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;

        if (isScrollingDown && scrollTop + clientHeight < scrollHeight - 2) {
          return; // Still has room to scroll down inside the element
        }
        if (isScrollingUp && scrollTop > 2) {
          return; // Still has room to scroll up inside the element
        }
      }

      if (scrollTimeout.current || animatingDir !== null) return;
      if (e.deltaY > 50) {
        // Next month (page flips up and disappears, revealing next month)
        flipPage(1);
      } else if (e.deltaY < -50) {
        // Previous month (new page flips down from top, covering current month)
        flipPage(-1);
      }
    };

    const flipPage = (dir: number) => {
      // Play flip sound cleanly without overlap issues
      if (flipAudioRef.current && soundEnabled) {
        flipAudioRef.current.currentTime = 0;
        flipAudioRef.current
          .play()
          .catch((e) => console.log("Flip Audio blocked:", e));
      }

      scrollTimeout.current = setTimeout(() => {
        scrollTimeout.current = null;
      }, 1000);

      setAnimatingDir(dir);

      if (topLayerRef.current) {
        gsap.set(topLayerRef.current, {
          transformPerspective: 1800,
          transformOrigin: "top center",
        });

        if (dir > 0) {
          // Flip current UP
          gsap.fromTo(
            topLayerRef.current,
            { rotationX: 0, opacity: 1 },
            {
              rotationX: 90,
              opacity: 0.2,
              duration: 0.6,
              ease: "power2.in",
              onComplete: () => {
                gsap.set(topLayerRef.current, { clearProps: "all" });
                setAnimatingDir(null);
                nextMonth();
              },
            },
          );
        } else {
          // Flip previous DOWN over current
          gsap.fromTo(
            topLayerRef.current,
            { rotationX: -90, opacity: 0 },
            {
              rotationX: 0,
              opacity: 1,
              duration: 0.7,
              ease: "back.out(1.2)",
              onComplete: () => {
                gsap.set(topLayerRef.current, { clearProps: "all" });
                setAnimatingDir(null);
                prevMonth();
              },
            },
          );
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" ||
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON"
      ) {
        return;
      }

      const scrollableContainer = target.closest(
        ".overflow-y-auto, .overflow-y-scroll",
      );
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (scrollableContainer) {
        const isSwipingDown = deltaY > 0;
        const isSwipingUp = deltaY < 0;
        const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;

        if (isSwipingDown && scrollTop + clientHeight < scrollHeight - 2) {
          return; // Still has room to scroll inside the element
        }
        if (isSwipingUp && scrollTop > 2) {
          return; // Still has room to scroll inside the element
        }
      }

      if (scrollTimeout.current || animatingDir !== null) return;

      if (deltaY > 50) {
        flipPage(1);
      } else if (deltaY < -50) {
        flipPage(-1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [nextMonth, prevMonth, currentDateStr, animatingDir, soundEnabled]);

  // Which dates to render on which layers based on direction:
  // If NO animation:
  // Bottom layer = none
  // Top layer = currentDate

  // If dir > 0 (going to NEXT):
  // Bottom layer = nextMonth (waiting fully visible under current)
  // Top layer = currentDate (flips AWAY)

  // If dir < 0 (going to PREV):
  // Bottom layer = currentDate (waiting completely visible under new incoming page)
  // Top layer = prevMonth (flips down IN)

  const topLayerDateStr = animatingDir === -1 ? prevMonthStr : currentDateStr;
  const bottomLayerDateStr = animatingDir === 1 ? nextMonthStr : currentDateStr;

  return (
    <div className="w-[90vw] md:w-[1000px] h-[80vh] min-h-[500px] md:h-[600px] relative z-10 pt-[10px] mx-auto">
      <TopBinding />

      {/* Bottom Layer (Static during animation) */}
      {animatingDir !== null && (
        <div className="calendar-base absolute top-[10px] left-0 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full h-[calc(100%-10px)] flex flex-col overflow-hidden origin-top rounded-b-md z-0">
          <CalendarHoles />
          {renderPage(bottomLayerDateStr)}
        </div>
      )}

      {/* Top Layer (Animates!) */}
      <div
        ref={topLayerRef}
        className="calendar-base absolute top-[10px] left-0 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full h-[calc(100%-10px)] flex flex-col overflow-hidden origin-top rounded-b-md z-10"
      >
        <CalendarHoles />
        {renderPage(topLayerDateStr)}
      </div>
    </div>
  );
}
