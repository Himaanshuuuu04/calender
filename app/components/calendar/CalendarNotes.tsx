import React from "react";
import { format } from "date-fns";
import { useCalendarStore } from "../../store/calendarStore";

const quotes = [
  "New year, new beginnings.",
  "Embrace the chilly winds.",
  "Spring into action.",
  "April showers bring May flowers.",
  "Bloom where you are planted.",
  "Summer vibes and sunny days.",
  "Sunshine is the best medicine.",
  "Make your own magic every day.",
  "Autumn shows us how beautiful it is to let things go.",
  "Crisp air, cozy sweaters.",
  "Give thanks for the simple joys.",
  "The magic of the season is here.",
];

export default function CalendarNotes({
  overrideDateStr,
}: {
  overrideDateStr?: string;
}) {
  const { currentDateStr, monthNotes, setMonthNote } = useCalendarStore();
  const currentDate = new Date(overrideDateStr || currentDateStr);
  const monthKey = format(currentDate, "yyyy-MM");
  const currentNotes = monthNotes[monthKey] || "";
  const monthIndex = currentDate.getMonth();

  return (
    <div className="order-2 md:order-1 w-[40%] md:w-full md:h-[35%] flex flex-col justify-start md:flex-row md:justify-between md:items-start md:gap-8">
      {/* Big Date Top */}
      <div className="flex flex-col items-start mb-4 md:mb-0 w-full md:w-1/4 pr-0 md:pr-2 gap-0">
        <h1 className="text-theme-accent text-[36px] md:text-[58px] font-black uppercase tracking-tighter leading-none m-0">
          {format(currentDate, "MMM")}
        </h1>
        <div className="text-theme-accent text-[24px] md:text-[32px] leading-none font-semibold">
          {format(currentDate, "yyyy")}
        </div>
        <p className="text-theme-accent opacity-80 text-[11px] md:text-sm font-medium mt-2 md:mt-0 leading-normal pr-1 md:pr-4">
          {quotes[monthIndex]}
        </p>
      </div>

      {/* General Notes for the month */}
      <div className="anim-text flex flex-col w-full md:w-3/4 px-0 md:px-1 grow min-h-[150px] md:min-h-0 md:h-full z-20">
        <h3 className="text-theme-accent text-sm md:text-lg font-semibold mb-1 md:mb-0">
          Notes
        </h3>
        <div className="relative flex-grow">
          <textarea
            value={currentNotes}
            onChange={(e) => setMonthNote(monthKey, e.target.value)}
            className="w-full h-full bg-transparent border-none resize-none outline-none leading-[32px] focus:ring-0 text-theme-text font-medium text-xs md:text-base"
            style={{
              backgroundImage:
                "linear-gradient(transparent, transparent 31px, #d1d5db 31px, #d1d5db 32px)",
              backgroundSize: "100% 32px",
              lineHeight: "32px",
              paddingTop: "4px",
            }}
            placeholder="Month notes..."
          ></textarea>
        </div>
      </div>
    </div>
  );
}

