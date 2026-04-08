import React, { useRef } from "react";
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

  const gridCellsRef = useRef<(HTMLDivElement | null)[]>([]);

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

  const handleDateClick = (day: Date, idx: number) => {
    if (gridCellsRef.current[idx]) {
      gsap.fromTo(
        gridCellsRef.current[idx],
        { scale: 0.8 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" },
      );
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
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
    <div className="order-1 md:order-2 w-[60%] md:w-full min-h-[300px] md:min-h-0 md:h-[65%] flex flex-col relative z-40 md:mt-4">
      {/* Action Tooltip Overlay */}
      {startDate && (
        <div
          className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 bg-theme-text text-white px-4 py-1.5 rounded-md shadow-lg text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-3 transition-opacity"
          style={{ pointerEvents: "auto" }}
        >
          <span>
            {endDate
              ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`
              : `${format(startDate, "MMM d")}`}
          </span>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-theme-accent text-white rounded w-5 h-5 flex items-center justify-center hover:brightness-125 cursor-pointer shadow-sm transition-transform hover:scale-110 active:scale-95 text-xs pb-[2px]"
            title="Manage Events & Notes"
          >
            &#x270E;
          </button>

          <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-theme-text rotate-45 pointer-events-none"></div>
        </div>
      )}

      {/* Header Row */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekHeaders.map((head, i) => (
          <div
            key={head}
            className={`text-center py-2 text-[9px] md:text-[11px] font-bold tracking-widest ${
              i >= 5
                ? "text-theme-accent"
                : "text-theme-text"
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

          return (
            <div
              key={d.toISOString()}
              ref={(el) => {
                gridCellsRef.current[i] = el;
              }}
              onClick={() => handleDateClick(d, i)}
              onContextMenu={(e) => handleRightClick(e, d, i)}
              onMouseEnter={() => setHoverDate(d)}
              className={`anim-day anim-month-change border-r border-b border-gray-200 p-2 flex justify-center items-center cursor-pointer transition-colors duration-150 relative ${
                isSelectedStart || isSelectedEnd
                  ? "bg-theme-highlight text-white  shadow-lg"
                  : isInRange || isHoverRange
                    ? "bg-theme-highlight-bg text-theme-highlight"
                    : isWeekend
                      ? "text-theme-accent"
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

