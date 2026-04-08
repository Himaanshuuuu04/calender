import WallCalendar from "./components/WallCalendar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <WallCalendar />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 z-50 opacity-60 hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-xs font-medium text-gray-600 bg-white/80 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-gray-200">
          ↕ Scroll or swipe to flip pages
        </span>
      </div>
    </main>
  );
}
