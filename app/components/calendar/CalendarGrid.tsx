import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isWithinInterval,
  isBefore,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useCalendarStore } from "../../store/calendarStore";
import { getIndianHoliday } from "../../utils/holidays";

// --- Sub-components ---

function TooltipOverlay({
  startDate,
  endDate,
  tooltipRef,
  onOpenModal,
}: {
  startDate: Date | null;
  endDate: Date | null;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  onOpenModal: () => void;
}) {
  if (!startDate) return null;
  return (
    <div
      ref={tooltipRef}
      className="absolute top-0 left-0 bg-theme-text text-white px-4 py-1.5 rounded-md shadow-lg text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-3"
      style={{
        pointerEvents: "auto",
        opacity: 0,
        scale: 0.8,
        zIndex: 100,
        transformOrigin: "bottom center",
      }}
    >
      <span>
        {endDate
          ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`
          : `${format(startDate, "MMM d")}`}
      </span>
      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation(); // prevent drag logic
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenModal();
        }}
        className="bg-theme-accent text-white rounded w-5 h-5 flex items-center justify-center hover:brightness-125 cursor-pointer shadow-sm transition-transform hover:scale-110 active:scale-95 text-xs pb-[2px]"
        title="Manage Events & Notes"
      >
        &#x270E;
      </button>
      <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-theme-text rotate-45 pointer-events-none"></div>
    </div>
  );
}

// --- Main Component ---

const weekHeaders = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function CalendarGrid({
  overrideDateStr,
}: {
  overrideDateStr?: string;
}) {
  const {
    currentDateStr,
    startDateStr,
    endDateStr,
    hoverDateStr,
    setStartDate,
    setEndDate,
    setHoverDate,
    setModalOpen,
    events,
    dateNotes,
  } = useCalendarStore();

  const [isDragging, setIsDragging] = useState(false);
  const previousSelectionRef = useRef<{ start: Date | null; end: Date | null }>(
    { start: null, end: null },
  );

  const gridCellsRef = useRef<(HTMLDivElement | null)[]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date(overrideDateStr || currentDateStr);
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;
  const hoverDate = hoverDateStr ? new Date(hoverDateStr) : null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateOfWeek = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDateOfWeek = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let currentDayIter = startDateOfWeek;
  while (currentDayIter <= endDateOfWeek) {
    days.push(currentDayIter);
    currentDayIter = addDays(currentDayIter, 1);
  }

  let targetDate = startDate;
  if (startDate && !endDate && hoverDate) {
    targetDate = hoverDate;
  } else if (startDate && endDate) {
    targetDate = isBefore(endDate, startDate) ? startDate : endDate;
  }
  const targetIndex = targetDate
    ? days.findIndex((d) => isSameDay(d, targetDate!))
    : -1;

  useEffect(() => {
    if (
      startDate &&
      targetIndex !== -1 &&
      tooltipRef.current &&
      gridContainerRef.current
    ) {
      const activeCell = gridCellsRef.current[targetIndex];
      if (activeCell) {
        const cellRect = activeCell.getBoundingClientRect();
        const containerRect = gridContainerRef.current.getBoundingClientRect();

        const x = cellRect.left - containerRect.left + cellRect.width / 2;
        const y = cellRect.top - containerRect.top - 6; // slightly above the cell

        // Quick set for initial xPercent/yPercent so GSAP knows how to translate
        gsap.set(tooltipRef.current, { xPercent: -50, yPercent: -100 });

        gsap.to(tooltipRef.current, {
          x,
          y,
          opacity: 1,
          scale: 1,
          duration: 2,
          ease: "elastic.out(0.1, 0.9)",
        });
      }
    }
  }, [startDate, targetIndex, hoverDate]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // If they release outside the grid, set the end date to wherever they hovered last
        if (startDate && hoverDate && !isSameDay(startDate, hoverDate)) {
          if (isBefore(hoverDate, startDate)) {
            setEndDate(startDate);
            setStartDate(hoverDate);
          } else {
            setEndDate(hoverDate);
          }
        }
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging, startDate, hoverDate]);

  const handleMouseDown = (day: Date, idx: number) => {
    previousSelectionRef.current = { start: startDate, end: endDate };
    setIsDragging(true);
    setStartDate(day);
    setEndDate(null);
    setHoverDate(null); // start fresh so tooltip resets quickly

    // Add brief timeout to set hover date naturally so the tooltip leaps
    setTimeout(() => setHoverDate(day), 10);

    if (gridCellsRef.current[idx]) {
      gsap.fromTo(
        gridCellsRef.current[idx],
        { scale: 0.8 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" },
      );
    }
  };

  const handleMouseEnterContainer = (day: Date) => {
    setHoverDate(day);
    if (isDragging && startDate) {
      if (isBefore(day, startDate)) {
        // Option 1: Inverse selection dynamically if dragging backwards
        // Let's just track hoverDate visually and finalize end date correctly
      }
    }
  };

  const handleMouseUp = (day: Date) => {
    // We prevent the global mouseup from doing extra work by checking if we're actively dragging inside a cell.
    if (isDragging && startDate) {
      if (isBefore(day, startDate)) {
        setEndDate(startDate);
        setStartDate(day);
      } else if (!isSameDay(day, startDate)) {
        setEndDate(day);
      } else {
        const prev = previousSelectionRef.current;
        // If they click on exactly the same single date that was already exclusively selected, deselect it.
        if (prev.start && !prev.end && isSameDay(day, prev.start)) {
          setStartDate(null);
          setEndDate(null);
          setHoverDate(null);
        } else {
          setEndDate(null);
        }
      }
      // Set to false manually so global listener doesn't trigger
      setTimeout(() => setIsDragging(false), 0);
    } else if (!isDragging && (!startDate || (startDate && endDate))) {
      // Just a simple click without dragging (or quick tap)
      setStartDate(day);
      setEndDate(null);
      setHoverDate(day);
    }
  };

  const handleRightClick = (e: React.MouseEvent, day: Date, idx: number) => {
    e.preventDefault();
    if (gridCellsRef.current[idx]) {
      gsap.fromTo(
        gridCellsRef.current[idx],
        { scale: 0.8 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" },
      );
    }
    setStartDate(day);
    setEndDate(null);
    setModalOpen(true);
  };

  return (
    <div
      ref={gridContainerRef}
      className="order-1 md:order-2 w-[60%] md:w-full min-h-[300px] md:min-h-0 md:h-[65%] flex flex-col relative z-40 md:mt-4 select-none"
    >
      {/* Action Tooltip Overlay */}
      {startDate && targetIndex !== -1 && (
        <TooltipOverlay
          startDate={startDate}
          endDate={endDate}
          tooltipRef={tooltipRef}
          onOpenModal={() => setModalOpen(true)}
        />
      )}

      {/* Header Row */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekHeaders.map((head, i) => (
          <div
            key={head}
            className={`text-center py-2 text-[9px] md:text-[11px] font-bold tracking-widest ${
              i >= 5 ? "text-theme-accent" : "text-theme-text"
            }`}
          >
            {head}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div
        className="grid grid-cols-7 grid-rows-5 grow border-l border-t border-gray-200 mt-2"
        onMouseLeave={() => setHoverDate(null)}
      >
        {days.map((d, i) => {
          const colIndex = i % 7;
          const isWeekend = colIndex >= 5;

          const isSelectedStart = startDate && isSameDay(d, startDate);
          const isSelectedEnd = endDate && isSameDay(d, endDate);
          const isInRange =
            startDate &&
            endDate &&
            isWithinInterval(d, { start: startDate, end: endDate });

          const isHoverRange =
            startDate &&
            !endDate &&
            hoverDate &&
            ((isWithinInterval(d, { start: startDate, end: hoverDate }) &&
              isBefore(startDate, hoverDate)) ||
              (isWithinInterval(d, {
                start: hoverDate,
                end: startDate,
              }) &&
                isBefore(hoverDate, startDate)));

          const dStart = startOfDay(d);
          const dEnd = endOfDay(d);

          const dayEvents = events.filter((evt) => {
            const eStart = startOfDay(new Date(evt.start));
            const eEnd = endOfDay(new Date(evt.end));
            return dEnd >= eStart && dStart <= eEnd;
          });

          const dateKeyForNotes = format(d, "yyyy-MM-dd");
          const hasNote = !!dateNotes[dateKeyForNotes];
          const holidayName = getIndianHoliday(d);

          return (
            <div
              key={d.toISOString()}
              ref={(el) => {
                gridCellsRef.current[i] = el;
              }}
              onMouseDown={() => handleMouseDown(d, i)}
              onMouseEnter={() => handleMouseEnterContainer(d)}
              onMouseUp={() => handleMouseUp(d)}
              onContextMenu={(e) => handleRightClick(e, d, i)}
              title={holidayName || undefined}
              className={`anim-day anim-month-change border-r border-b border-gray-200 p-2 flex flex-col justify-center items-center cursor-pointer transition-colors duration-150 relative ${
                isSelectedStart || isSelectedEnd
                  ? "bg-theme-highlight text-white  shadow-lg"
                  : isInRange || isHoverRange
                    ? "bg-theme-highlight-bg text-theme-highlight"
                    : holidayName
                      ? "bg-orange-100 text-orange-600"
                      : isWeekend
                        ? "text-theme-accent bg-white"
                        : "bg-white text-theme-text"
              }`}
            >
              <div
                className={`relative flex justify-center items-center h-6 w-6 md:h-8 md:w-8 rounded-full`}
              >
                <span className={`text-sm md:text-base font-semibold`}>
                  {format(d, "d")}
                </span>

                {/* Event and Notes Markers */}
                <div className="absolute -bottom-1.5 flex gap-[2px]">
                  {holidayName && (
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-orange-500"
                      title={holidayName}
                    ></div>
                  )}
                  {dayEvents.slice(0, 3).map((evt, idx) => (
                    <div
                      key={"evt-" + idx}
                      className={`w-1 h-1 rounded-full bg-theme-accent`}
                      title={evt.title}
                    ></div>
                  ))}
                  {hasNote && (
                    <div
                      className={`w-1 h-1 rounded-full bg-theme-highlight`}
                      title="Has Notes"
                    ></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
