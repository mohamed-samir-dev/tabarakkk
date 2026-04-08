"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IoCartOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import type { Product } from "./types";
import { useCartStore } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("en-US");

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { name, salePrice, discountPercent = 0 } = product;
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
    <Link href={`/product/${product._id}`} className="relative bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden  hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full" dir="rtl">
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="absolute z-10 top-2 right-2 bg-red-600 text-white text-[9px] sm:text-xs md:text-sm font-bold px-1.5 sm:px-2.5 md:px-3 py-0.5 rounded-full">
          {discountPercent}%-
        </span>
      )}

      {/* Image */}
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0 bg-white">
          {resolvedImage ? (
            <Image src={resolvedImage} alt={name} fill className="object-contain p-2 sm:p-4" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" priority={priority} loading={priority ? "eager" : "lazy"} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl sm:text-5xl">📱</div>
          )}
        </div>
      </div>

      {/* Name + Price */}
      <div className="px-2 sm:px-3 pt-2 sm:pt-3 pb-1.5 sm:pb-2 flex flex-col gap-1 flex-1">
        <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 leading-snug line-clamp-2">{name}</h3>

        <div className="flex flex-col gap-0.5 mt-auto">
          {hasDiscount ? (
            <>
              <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 line-through">{fmt(originalPrice)} ر.س</span>
              <span className="text-sm sm:text-base md:text-lg font-extrabold text-red-600">{fmt(salePrice)} ر.س</span>
            </>
          ) : (
            <span className="text-sm sm:text-base md:text-lg font-extrabold text-red-600">{fmt(originalPrice)} ر.س</span>
          )}
        </div>
      </div>

      {/* Cart Button */}
      <div className="px-2 sm:px-3 pb-2 sm:pb-3 pt-1">
        <button
          onClick={handleAddToCart}
          className={`cart-btn ${added ? "added" : ""}`}
        >
          {added ? (
            <><IoCheckmarkCircleOutline size={16} className="sm:hidden" /><IoCheckmarkCircleOutline size={18} className="hidden sm:block lg:hidden" /><IoCheckmarkCircleOutline size={20} className="hidden lg:block" />تمت الإضافة</>
          ) : (
            <><IoCartOutline size={16} className="sm:hidden" /><IoCartOutline size={18} className="hidden sm:block lg:hidden" /><IoCartOutline size={20} className="hidden lg:block" />أضف للسلة</>
          )}
        </button>
      </div>
    </Link>
    </>
  );
}
