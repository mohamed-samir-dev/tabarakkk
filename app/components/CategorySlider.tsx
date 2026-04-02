"use client";
import Image from "next/image";
import Link from "next/link";

type Category = { name: string; count: number; image: string; href: string };

export default function CategorySlider({ categories }: { categories: Category[] }) {
  const items = [...categories, ...categories];

  return (
    <div className="w-full overflow-hidden relative" dir="ltr" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 60s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-track">
        {items.map((cat, i) => (
          <Link
            key={`${cat.name}-${i}`}
            href={cat.href}
            className="shrink-0 flex flex-col items-center gap-2 group mx-3 w-[90px]"
          >
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-transparent border-2 border-gray-200 group-hover:border-[#7CC043] overflow-hidden relative transition-all duration-200 shadow-sm group-hover:shadow-md">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  unoptimized
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight line-clamp-2 group-hover:text-[#1F6F8B] transition-colors w-full" dir="rtl">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
