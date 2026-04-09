import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { format, startOfDay, endOfDay } from "date-fns";
import { useCalendarStore, CalendarEvent } from "../../store/calendarStore";
import { v4 as uuidv4 } from "uuid";
import { getIndianHoliday } from "../../utils/holidays";
export default function CalendarModal() {
  const {
    isDetailsModalOpen,
    startDateStr,
    endDateStr,
    events,
    dateNotes,
    addEvent,
    deleteEvent,
    setDateNote,
    setModalOpen,
  } = useCalendarStore();

  const [eventTitle, setEventTitle] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animation handled internally
  useEffect(() => {
    if (isDetailsModalOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [isDetailsModalOpen]);

  if (!isDetailsModalOpen || !startDateStr) return null;

  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : startDate;

  const getIndianHoliday = (date: Date) => {
    const m = date.getMonth();
    const d = date.getDate();
    if (m === 0 && d === 26) return "Republic Day (India)";
    if (m === 7 && d === 15) return "Independence Day (India)";
    if (m === 9 && d === 2) return "Gandhi Jayanti (India)";
    return null;
  };

  const holidayName =
    !endDateStr || startDateStr === endDateStr
      ? getIndianHoliday(startDate)
      : null;

  const getActiveRangeKey = () => {
    return endDateStr
      ? format(startDate, "yyyy-MM-dd") + "_" + format(endDate, "yyyy-MM-dd")
      : format(startDate, "yyyy-MM-dd");
  };

  const key = getActiveRangeKey();
  const activeDateNote = dateNotes[key] || "";

  const closeDetailsModal = () => {
    setModalOpen(false);
    setEventTitle("");
  };

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) return;
    const newEvent: CalendarEvent = {
      id: uuidv4(),
      title: eventTitle.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
    addEvent(newEvent);
    setEventTitle("");

    gsap.fromTo(
      ".modal-content-area",
      { scale: 0.95 },
      { scale: 1, duration: 0.4, ease: "back.out(2)" },
    );
  };

  const handleSaveDateNote = (val: string) => {
    setDateNote(key, val);
  };

  const activeRangeEvents = events.filter((evt) => {
    const sStart = startOfDay(startDate);
    const sEnd = endOfDay(endDate);
    const eStart = startOfDay(new Date(evt.start));
    const eEnd = endOfDay(new Date(evt.end));
    return sEnd >= eStart && sStart <= eEnd;
  });

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div
        ref={modalRef}
        className="bg-white rounded shadow-2xl w-[400px] flex flex-col gap-0 border-[0px] border-[color:var(--theme-text)] relative overflow-hidden"
      >
        <div
          className="absolute top-[-2px] left-[-2px] w-10 h-10  bg-[color:var(--theme-accent)]"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        ></div>

        <div className="bg-[color:var(--theme-text)] p-6 pb-4 text-center">
          <h3 className="text-white font-black text-2xl md:text-3xl tracking-tighter uppercase m-0 leading-none">
            Manage Date
          </h3>
          <div className="flex flex-col items-center">
            <p className="text-[11px] text-[color:var(--theme-accent)] uppercase font-black tracking-widest mt-2 bg-white/10 py-1 rounded inline-block px-3">
              {endDateStr
                ? `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
                : `${format(startDate, "MMM d, yyyy")}`}
            </p>
            {holidayName && (
              <p className="text-xs text-orange-200 uppercase font-black tracking-widest mt-2 bg-orange-900/30 border border-orange-500/40 py-1 rounded inline-block px-3">
                🇮🇳 {holidayName}
              </p>
            )}
          </div>
        </div>

        <div className="modal-content-area p-5 md:p-6 flex flex-col gap-6 bg-[#fafafa] flex-1">
          {/* Event Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b-[1.5px] border-gray-200 pb-2">
              <span className="text-[color:var(--theme-accent)] text-sm font-bold uppercase tracking-widest">
                Events
              </span>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {activeRangeEvents.length}
              </span>
            </div>

            {activeRangeEvents.length > 0 ? (
              <ul className="text-[color:var(--theme-text)] font-semibold text-sm max-h-[120px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {activeRangeEvents.map((evt) => (
                  <li
                    key={evt.id}
                    className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 shadow-sm group hover:border-[color:var(--theme-accent)] transition-colors"
                  >
                    <div className="flex gap-3 items-center truncate">
                      <div className="w-2 h-2 rounded-full bg-[color:var(--theme-accent)] flex-shrink-0"></div>
                      <span className="truncate">{evt.title}</span>
                    </div>
                    <button
                      onClick={() => deleteEvent(evt.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="Remove Event"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-gray-400 italic text-xs">
                  No events scheduled.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEvent()}
                className="flex-grow border-[1.5px] border-gray-300 hover:border-[color:var(--theme-accent)] focus:border-[color:var(--theme-accent)] outline-none px-3 py-2 text-sm font-medium text-[color:var(--theme-text)] transition-colors rounded shadow-sm bg-white placeholder-gray-400"
                placeholder="What's happening?"
              />
              <button
                onClick={handleSaveEvent}
                disabled={!eventTitle.trim()}
                className="bg-[color:var(--theme-accent)] text-white font-bold text-sm px-4 py-2 uppercase hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded shadow-sm flex items-center justify-center min-w-[70px]"
              >
                Add
              </button>
            </div>
          </div>

          {/* Specific Note Section */}
          <div className="flex flex-col gap-3">
            <span className="text-[color:var(--theme-accent)] text-sm font-bold uppercase tracking-widest border-b-[1.5px] border-gray-200 pb-2">
              Notes
            </span>
            <textarea
              value={activeDateNote}
              onChange={(e) => handleSaveDateNote(e.target.value)}
              className="w-full h-24 bg-white border-[1.5px] border-gray-300 p-3 resize-none outline-none focus:border-[color:var(--theme-text)] hover:border-[color:var(--theme-text)] text-[color:var(--theme-text)] text-sm font-medium transition-colors rounded shadow-sm placeholder-gray-400"
              placeholder="Drop a note for this specific date..."
            ></textarea>
          </div>
        </div>

        <div className="p-4 bg-gray-100 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={closeDetailsModal}
            className="text-[color:var(--theme-text)] bg-white border border-[color:var(--theme-text)] hover:bg-[color:var(--theme-text)] hover:text-white font-bold text-xs uppercase px-8 py-2 md:py-2.5 transition-all cursor-pointer rounded shadow-sm w-full"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
