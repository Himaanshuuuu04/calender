import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { format, startOfDay, endOfDay } from "date-fns";
import { useCalendarStore, CalendarEvent } from "../../store/calendarStore";
import { v4 as uuidv4 } from 'uuid';
export default function CalendarModal() {
  const {
    isDetailsModalOpen,
    startDateStr,
    endDateStr,
    events,
    dateNotes,
    addEvent,
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
        className="bg-white rounded shadow-2xl w-[400px] flex flex-col gap-0 border-[3px] border-[color:var(--theme-text)] relative overflow-hidden"
      >
        <div
          className="absolute top-[-2px] left-[-2px] w-10 h-10  bg-[color:var(--theme-accent)]"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        ></div>

        <div className="bg-[color:var(--theme-text)] p-6 pb-4 text-center">
          <h3 className="text-white font-black text-3xl tracking-tighter uppercase m-0 leading-none">
            Details
          </h3>
          <p className="text-[11px] text-[color:var(--theme-accent)] uppercase font-black tracking-widest mt-2 bg-white/10 py-1 rounded inline-block px-3">
            {endDateStr
              ? `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
              : `${format(startDate, "MMM d, yyyy")}`}
          </p>
        </div>

        <div className="modal-content-area p-6 flex flex-col gap-6 bg-[#fafafa]">
          {/* Event Section */}
          <div className="flex flex-col gap-2">
            <span className="text-[color:var(--theme-accent)] text-sm font-bold uppercase tracking-widest border-b-[1.5px] border-gray-200 pb-1">
              Events
            </span>

            {activeRangeEvents.length > 0 ? (
              <ul className="text-[color:var(--theme-text)] font-semibold text-sm max-h-[100px] overflow-y-auto space-y-1 pl-1">
                {activeRangeEvents.map((evt) => (
                  <li key={evt.id} className="flex gap-2 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--theme-accent)]"></div>
                    {evt.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic text-xs">No events.</p>
            )}

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEvent()}
                className="flex-grow border-[1.5px] border-gray-300 hover:border-[color:var(--theme-accent)] focus:border-[color:var(--theme-accent)] outline-none px-3 py-1.5 text-sm font-semibold text-[color:var(--theme-text)] transition-colors rounded-sm"
                placeholder="New event..."
              />
              <button
                onClick={handleSaveEvent}
                className="bg-[color:var(--theme-accent)] text-white font-bold text-sm px-4 py-1.5 uppercase hover:brightness-125 transition-colors rounded-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Specific Note Section */}
          <div className="flex flex-col gap-2">
            <span className="text-[color:var(--theme-accent)] text-sm font-bold uppercase tracking-widest border-b-[1.5px] border-gray-200 pb-1">
              Notes for Selection
            </span>
            <textarea
              value={activeDateNote}
              onChange={(e) => handleSaveDateNote(e.target.value)}
              className="w-full h-24 bg-transparent border-[1.5px] border-gray-300 p-2 resize-none outline-none focus:border-[color:var(--theme-text)] text-[color:var(--theme-text)] text-sm font-medium transition-colors rounded-sm"
              placeholder="Drop a note for this specific date..."
            ></textarea>
          </div>
        </div>

        <div className="p-4 bg-gray-100 flex justify-center border-t border-gray-200">
          <button
            onClick={closeDetailsModal}
            className="text-[color:var(--theme-text)] bg-white border-2 border-[color:var(--theme-text)] hover:bg-[color:var(--theme-text)] hover:text-white font-bold text-xs uppercase px-8 py-2 transition-all cursor-pointer rounded-sm"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
}
