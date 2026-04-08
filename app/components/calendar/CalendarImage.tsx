import React from "react";
import { useCalendarStore } from "../../store/calendarStore";
export default function CalendarImage({
  overrideDateStr,
}: {
  overrideDateStr?: string;
}) {
  const { getImageForMonth } = useCalendarStore();
  const imageUrl = getImageForMonth(overrideDateStr);

  return (
    <div className="cal-section-left">
      <img
        src={imageUrl}
        crossOrigin="anonymous"
        alt="Calendar"
        className="anim-image anim-month-change w-full xl:w-full h-full object-cover"
      />

      <div
        className="absolute top-0 right-0 w-full h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom right, transparent 50%, white 50%)",
          backgroundSize: "200% 200%",
          backgroundPosition: "top left",
          opacity: 0,
        }}
      ></div>

      {/* Top Right Teal Band / Triangle */}
      <div
        className="anim-shape absolute top-0 right-0 w-[45%] h-[60%] bg-theme-accent z-20 pointer-events-none"  
        style={{ clipPath: "polygon(100% 0, 20% 0, 100% 70%)" }}
      ></div>
      <div
        className="anim-shape absolute top-0 right-0 w-[47%] h-[63%] bg-white z-10 pointer-events-none"
        style={{ clipPath: "polygon(100% 0, 20% 0, 100% 70%)" }}
      ></div>

      {/* Bottom Left Triangle styling */}
      <div
        className="anim-shape absolute bottom-[-1px] left-[-1px] w-[35%] h-[60%] bg-theme-text z-10 pointer-events-none"
        style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
      ></div>
      <div
        className="anim-shape absolute bottom-[-1px] left-[-1px] w-[45%] h-[55%] bg-theme-accent z-30 pointer-events-none"
        style={{ clipPath: "polygon(0 60%, 55% 42%, 100% 100%, 0 100%)" }}
      ></div>
      <div
        className="anim-shape absolute bottom-[-1px] left-[-1px] w-[47%] h-[57%] bg-white z-20 pointer-events-none"
        style={{ clipPath: "polygon(0 60%, 55% 42%, 100% 100%, 0 100%)" }}
      ></div>
    </div>
  );
}

