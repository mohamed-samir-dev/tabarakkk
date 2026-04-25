"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../products/ProductCard";
import type { Product } from "../products/types";
import { IoChevronBack, IoChevronForward, IoHomeOutline } from "react-icons/io5";
import { HiOutlineSparkles } from "react-icons/hi2";
import { BsGrid3X3GapFill } from "react-icons/bs";

const ITEMS_PER_PAGE = 12;

interface Props {
  title: string;
  parentLabel?: string;
  parentHref?: string;
  products: Product[];
  loading: boolean;
  emptyIcon?: string;
}

/* ── floating orbs in hero ── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 320, h: 320, top: "-15%", right: "-8%", bg: "radial-gradient(circle, rgba(124,192,67,0.15) 0%, transparent 70%)", dur: 18 },
        { w: 240, h: 240, bottom: "-10%", left: "-5%", bg: "radial-gradient(circle, rgba(31,111,139,0.2) 0%, transparent 70%)", dur: 22 },
        { w: 160, h: 160, top: "20%", left: "30%", bg: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", dur: 15 },
        { w: 100, h: 100, top: "60%", right: "20%", bg: "radial-gradient(circle, rgba(124,192,67,0.1) 0%, transparent 70%)", dur: 20 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: orb.w, height: orb.h, top: orb.top, bottom: (orb as Record<string, unknown>).bottom as string, left: orb.left, right: orb.right, background: orb.bg }}
          animate={{ y: [0, -20, 0, 15, 0], x: [0, 10, 0, -10, 0], scale: [1, 1.08, 1, 0.95, 1] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── shimmer skeleton ── */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="cat-skeleton-card rounded-2xl overflow-hidden"
        >
          <div className="aspect-square cat-shimmer" />
          <div className="p-3.5 space-y-3">
            <div className="h-3.5 rounded-full w-[80%] cat-shimmer" />
            <div className="h-3 rounded-full w-[55%] cat-shimmer" />
            <div className="h-9 rounded-xl cat-shimmer mt-2" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── empty state ── */
function EmptyState({ icon }: { icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="flex flex-col items-center justify-center py-20 sm:py-32 gap-5 text-center"
    >
      <motion.div
        className="cat-empty-icon"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-5xl">{icon}</span>
      </motion.div>
      <div>
        <p className="text-gray-700 text-lg sm:text-xl font-extrabold mb-1.5">المنتجات ستُضاف قريباً</p>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">هذا القسم قيد التحضير، تابعنا للمزيد من المنتجات المميزة</p>
      </div>
      <Link href="/" className="cat-back-btn">
        <IoHomeOutline size={16} />
        العودة للرئيسية
      </Link>
    </motion.div>
  );
}

/* ── main layout ── */
export default function CategoryLayout({ title, parentLabel, parentHref = "/", products, loading, emptyIcon = "📦" }: Props) {
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const goToPage = (n: number) => {
    setPage(n);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentProducts = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen cat-page-bg" dir="rtl">
      {/* ═══ HERO ═══ */}
      <div className="cat-hero relative overflow-hidden">
        <FloatingOrbs />
        {/* mesh noise overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {/* breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center gap-2 text-[11px] sm:text-sm pt-5 sm:pt-8 mb-5 sm:mb-8"
          >
            <Link href="/" className="cat-breadcrumb-pill">
              <IoHomeOutline size={13} />
              الرئيسية
            </Link>
            {parentLabel && (
              <>
                <IoChevronBack size={11} className="text-white/30" />
                {parentHref ? (
                  <Link href={parentHref} className="cat-breadcrumb-pill">{parentLabel}</Link>
                ) : (
                  <span className="cat-breadcrumb-pill">{parentLabel}</span>
                )}
              </>
            )}
          </motion.div>

          {/* title block */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
            className="pb-12 sm:pb-16"
          >
            <div className="flex items-start gap-3.5 sm:gap-4">
              <motion.div
                className="cat-icon-box"
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <HiOutlineSparkles className="text-[#7CC043] text-xl sm:text-2xl" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">{title}</h1>
                <p className="text-white/50 text-xs sm:text-sm mt-1.5 font-medium">اكتشف أفضل المنتجات بأسعار لا تُقاوم</p>
              </div>
              {!loading && products.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="cat-count-badge"
                >
                  <span className="text-lg sm:text-xl font-black">{products.length}</span>
                  <span className="text-[10px] sm:text-xs opacity-70">منتج</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 60V30C180 10 360 0 540 10C720 20 900 45 1080 45C1260 45 1350 30 1440 20V60H0Z" fill="#f7fafb" />
            <path d="M0 60V40C200 20 400 15 600 25C800 35 1000 50 1200 45C1320 42 1380 35 1440 30V60H0Z" fill="#f0f5f7" fillOpacity="0.5" />
          </svg>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div ref={gridRef} className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-10 scroll-mt-4">
        {loading ? (
          <SkeletonGrid />
        ) : !products.length ? (
          <EmptyState icon={emptyIcon} />
        ) : (
          <>
            {/* toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between mb-5 sm:mb-8"
            >
              <div className="cat-toolbar-badge">
                <BsGrid3X3GapFill className="text-[#1F6F8B]" size={14} />
                <span className="text-sm font-extrabold text-[#0a3550]">{products.length}</span>
                <span className="text-[11px] text-gray-400 font-medium">منتج متوفر</span>
              </div>
              {totalPages > 1 && (
                <div className="cat-page-indicator">
                  <span className="text-[11px] text-gray-400">صفحة</span>
                  <span className="text-sm font-bold text-[#0F4C6E]">{page}</span>
                  <span className="text-[11px] text-gray-400">من {totalPages}</span>
                </div>
              )}
            </motion.div>

            {/* products grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
              >
                {currentProducts.map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: mounted ? i * 0.06 : 0,
                      duration: 0.45,
                      type: "spring",
                      stiffness: 120,
                      damping: 14,
                    }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="cat-pagination"
              >
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="cat-pg-arrow"
                >
                  <IoChevronForward size={18} />
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => goToPage(n)}
                      className={`cat-pg-num ${page === n ? "active" : ""}`}
                    >
                      {page === n && (
                        <motion.div
                          layoutId="activePage"
                          className="absolute inset-0 cat-pg-active-bg rounded-xl"
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      )}
                      <span className="relative z-10">{n}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="cat-pg-arrow"
                >
                  <IoChevronBack size={18} />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
