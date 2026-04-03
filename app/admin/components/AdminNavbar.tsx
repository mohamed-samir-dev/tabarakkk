"use client";

export default function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 right-0 left-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center px-4 md:pr-68">
      <button
        className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
        onClick={onMenuClick}
        aria-label="فتح القائمة"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="mr-3 font-bold text-gray-800 text-lg">لوحة التحكم</span>
    </header>
  );
}
