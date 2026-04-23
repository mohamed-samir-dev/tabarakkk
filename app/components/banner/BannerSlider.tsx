"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

const AUTO_PLAY_MS = 5500;
const SWIPE_THRESHOLD = 50;

export default function BannerSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStart = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [2, -2]);
  const rotateY = useTransform(mouseX, [0, 1], [-2, 2]);

  const goTo = useCallback(
    (i: number, dir?: number) => {
      const next = (i + images.length) % images.length;
      setDirection(dir ?? (next > current ? 1 : -1));
      setProgress(0);
      setCurrent(next);
    },
    [images.length, current]
  );

  // Auto-play (pause on hover)
  useEffect(() => {
    if (isHovered) return;
    intervalRef.current = setInterval(() => goTo(current + 1, 1), AUTO_PLAY_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [current, goTo, isHovered]);

  // Progress
  useEffect(() => {
    if (isHovered) return;
    setProgress(0);
    const step = 30;
    const inc = (step / AUTO_PLAY_MS) * 100;
    progressRef.current = setInterval(() => setProgress((p) => Math.min(p + inc, 100)), step);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [current, isHovered]);

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) goTo(current + (diff > 0 ? 1 : -1), diff > 0 ? 1 : -1);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const variants = {
    enter: (d: number) => ({
      x: `${d * 60}%`,
      opacity: 0,
      scale: 1.08,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (d: number) => ({
      x: `${-d * 60}%`,
      opacity: 0,
      scale: 0.92,
      filter: "blur(4px)",
    }),
  };

  return (
    <section className="w-full flex justify-center pt-3 sm:pt-5 pb-1 sm:pb-2 px-3 sm:px-4 md:px-6">
      <div className="relative w-full max-w-7xl">
        {/* Animated gradient border glow */}
        <div className="absolute -inset-[2px] rounded-[20px] sm:rounded-[28px] overflow-hidden -z-10">
          <motion.div
            className="absolute inset-0"
            style={{
              background: "conic-gradient(from 0deg, #0F4C6E, #1F6F8B, #7CC043, #5FA32E, #1F6F8B, #0F4C6E)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-[2px] rounded-[18px] sm:rounded-[26px] bg-white" />
        </div>

        {/* Main container with 3D tilt */}
        <motion.div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
          style={{
            perspective: 1000,
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            boxShadow: "0 4px 20px rgba(15,76,110,0.12), 0 12px 40px rgba(15,76,110,0.08)",
          }}
          whileHover={{
            boxShadow: "0 8px 30px rgba(15,76,110,0.18), 0 20px 60px rgba(15,76,110,0.12)",
          }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
          onMouseMove={handleMouseMove}
        >
          {/* Slider area */}
          <div
            className="relative w-full"
            style={{ aspectRatio: "2.2/1" }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Gradient overlays */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#0a3550]/30 via-transparent to-transparent" />
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#0F4C6E]/10 via-transparent to-[#0F4C6E]/10" />

            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0"
              >
                {/* Ken Burns subtle zoom */}
                <motion.div
                  className="w-full h-full"
                  animate={{ scale: [1, 1.04] }}
                  transition={{ duration: AUTO_PLAY_MS / 1000, ease: "linear" }}
                >
                  <Image
                    src={images[current]}
                    alt={`banner ${current + 1}`}
                    fill
                    className="object-cover"
                    priority={current === 0}
                    unoptimized
                    sizes="100vw"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <motion.button
                  onClick={() => goTo(current + 1, 1)}
                  aria-label="التالي"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, rgba(15,76,110,0.5), rgba(31,111,139,0.4))",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ scale: 1.15, background: "linear-gradient(135deg, rgba(124,192,67,0.7), rgba(95,163,46,0.6))" }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => goTo(current - 1, -1)}
                  aria-label="السابق"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, rgba(15,76,110,0.5), rgba(31,111,139,0.4))",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  initial={{ opacity: 0, x: 10 }}
                  whileHover={{ scale: 1.15, background: "linear-gradient(135deg, rgba(124,192,67,0.7), rgba(95,163,46,0.6))" }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
                  transition={{ duration: 0.25 }}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </>
            )}

            {/* Bottom progress bar */}
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #7CC043, #5FA32E)",
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Thumbnail strip + dots */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
            {images.map((src, i) => (
              <motion.button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`الانتقال للشريحة ${i + 1}`}
                className="relative rounded-lg sm:rounded-xl overflow-hidden cursor-pointer"
                animate={{
                  width: i === current ? 48 : 10,
                  height: i === current ? 28 : 10,
                  borderRadius: i === current ? 10 : 20,
                  opacity: i === current ? 1 : 0.5,
                }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                style={{
                  border: i === current ? "2px solid #1F6F8B" : "2px solid #d1d5db",
                  boxShadow: i === current ? "0 2px 10px rgba(31,111,139,0.3)" : "none",
                }}
              >
                {i === current ? (
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="48px"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: i === current ? "#1F6F8B" : "#E6F2F8" }}
                  />
                )}
                {/* Active green ring animation */}
                {i === current && (
                  <motion.div
                    className="absolute inset-0 rounded-lg sm:rounded-xl"
                    style={{ border: "2px solid #7CC043" }}
                    initial={{ opacity: 0, scale: 1.3 }}
                    animate={{ opacity: [0, 1, 0], scale: [1.3, 1, 1] }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
