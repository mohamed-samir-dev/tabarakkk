"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IoCartOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { GoShieldCheck } from "react-icons/go";
import type { Product } from "./types";
import { useCartStore } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("en-US");

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { name, salePrice, discountPercent = 0, freeDelivery, warrantyYears, inStock } = product;
  const image = product.images?.[0] || product.image;
  const resolvedImage = image ? resolveImg(image) : undefined;
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const hasDiscount = salePrice != null && salePrice !== originalPrice;
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product);
    setAdded(true);
    setToast(true);
    setTimeout(() => {
      setToast(false);
      setAdded(false);
      window.scrollTo(0, 0);
      router.push("/cart");
    }, 1000);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-base font-medium animate-fade-in-down">
          <IoCheckmarkCircleOutline size={18} />
          تمت إضافة المنتج للسلة
        </div>
      )}

      <Link
        href={`/product/${product._id}`}
        className="group relative bg-white rounded-2xl overflow-hidden flex flex-col h-full ring-1 ring-black/[0.04] shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
        dir="rtl"
      >
        {/* Image */}
        <div className="relative w-full bg-white" style={{ paddingBottom: "100%" }}>
          <div className="absolute inset-0">
            {resolvedImage ? (
              <Image
                src={resolvedImage}
                alt={name}
                fill
                className="object-contain p-4 sm:p-6 group-hover:scale-[1.04] transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📱</div>
            )}
          </div>

          {/* Badges on image */}
          {discountPercent > 0 && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg leading-none shadow-sm">
              {discountPercent}%-
            </span>
          )}

          {inStock ? (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-emerald-50 text-emerald-600 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-lg leading-none ring-1 ring-emerald-200">
              ● متوفر
            </span>
          ) : (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gray-100 text-gray-500 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-lg leading-none ring-1 ring-gray-200">
              غير متوفر
            </span>
          )}
        </div>

        {/* Content */}
        <div className="px-3 sm:px-4 pt-3 sm:pt-3.5 pb-2 flex flex-col gap-2 flex-1">
          <h3 className="text-xs sm:text-sm md:text-[15px] font-semibold text-gray-900 leading-relaxed line-clamp-2">
            {name}
          </h3>

          {(freeDelivery || warrantyYears > 0) && (
            <div className="flex items-center gap-2.5">
              {freeDelivery && (
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500">
                  <TbTruckDelivery size={13} className="text-emerald-500" />
                  توصيل مجاني
                </span>
              )}
              {warrantyYears > 0 && (
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500">
                  <GoShieldCheck size={12} className="text-sky-500" />
                  ضمان {warrantyYears}س
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-1.5 border-t border-gray-100">
            {hasDiscount ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[15px] sm:text-lg md:text-xl font-bold text-gray-900">
                    {fmt(salePrice)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400">ر.س</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                    {fmt(originalPrice)} ر.س
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600">
                    وفّر {fmt(originalPrice - salePrice!)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-[15px] sm:text-lg md:text-xl font-bold text-gray-900">
                  {fmt(originalPrice)}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400">ر.س</span>
              </div>
            )}
          </div>
        </div>

        {/* Cart Button */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-3.5 pt-0.5">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`cart-btn ${added ? "added" : ""} ${!inStock ? "!bg-gray-300 !shadow-none cursor-not-allowed" : ""}`}
          >
            {added ? (
              <><IoCheckmarkCircleOutline size={16} className="sm:hidden" /><IoCheckmarkCircleOutline size={18} className="hidden sm:block lg:hidden" /><IoCheckmarkCircleOutline size={20} className="hidden lg:block" />تمت الإضافة</>
            ) : (
              <><IoCartOutline size={16} className="sm:hidden" /><IoCartOutline size={18} className="hidden sm:block lg:hidden" /><IoCartOutline size={20} className="hidden lg:block" />{inStock ? "أضف للسلة" : "غير متوفر"}</>
            )}
          </button>
        </div>
      </Link>
    </>
  );
}
