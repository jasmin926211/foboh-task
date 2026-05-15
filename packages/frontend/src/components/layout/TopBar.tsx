import { Bell, HelpCircle } from 'lucide-react';

export function TopBar() {
  return (
    <header className="fixed top-0 left-[240px] right-0 h-20 bg-teal z-30 flex items-center justify-between px-8">
      {/* Left - Greeting */}
      <div>
        <h2 className="text-lg font-semibold text-white">Hello, Ekemini</h2>
        <p className="text-[13px] font-normal text-white/80">Tue, 13 February 2024</p>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
          <Bell className="h-[18px] w-[18px] text-teal" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
          <HelpCircle className="h-[18px] w-[18px] text-teal" />
        </button>

        <div className="text-right">
          <p className="text-sm font-semibold text-white">Ekemini Mark</p>
          <p className="text-xs text-white/80">Heaps Normal</p>
        </div>

        <div
          className="h-10 w-10 rounded-full"
          style={{
            background: `repeating-conic-gradient(#333 0% 25%, #fff 0% 50%) 50% / 10px 10px`
          }}
        />
      </div>
    </header>
  );
}
