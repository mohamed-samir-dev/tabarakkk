"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowForward, IoShareSocialOutline, IoHomeOutline, IoChevronBack } from "react-icons/io5";
import { motion } from "framer-motion";
import type { Product } from "../../components/products/types";
import { useCartStore } from "../../store/cartStore";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import ProductDetails from "./components/ProductDetails";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductPageClient({ id, initialProduct }: { id: string; initialProduct: Product | null }) {
  const router = useRouter();
  const [product] = useState<Product | null>(initialProduct);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center product-page-bg">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#0F4C6E]/10 to-[#7CC043]/10 flex items-center justify-center">
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-gray-400 text-lg">المنتج غير موجود</p>
        </div>
      </div>
    );

  const resolveImg = (src: string) =>
    src.startsWith("http") ? src : src.startsWith("/uploads") ? src : `${API}${src}`;

  const allImages = (product.images?.length ? product.images : product.image ? [product.image] : []).map(resolveImg);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <main className="min-h-screen product-page-bg pb-20" dir="rtl">
      {/* Premium sticky header */}
      <div className="sticky top-0 z-40 product-header-glass">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Main row */}
          <div className="flex items-center justify-between py-2.5 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <motion.button
                onClick={() => router.back()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0F4C6E] to-[#1F6F8B] text-white shadow-md shadow-[#0F4C6E]/20 shrink-0 cursor-pointer"
              >
                <IoArrowForward size={18} />
              </motion.button>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{product.name}</h1>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 mt-0.5">
                  <button onClick={() => router.push("/")} className="hover:text-[#0F4C6E] transition flex items-center gap-0.5 cursor-pointer">
                    <IoHomeOutline size={10} />
                    <span>الرئيسية</span>
                  </button>
                  <IoChevronBack size={8} />
                  {product.brand && (
                    <>
                      <span className="text-gray-400">{product.brand}</span>
                      <IoChevronBack size={8} />
                    </>
                  )}
                  <span className="text-[#0F4C6E] font-semibold truncate max-w-[120px] sm:max-w-[200px]">{product.name}</span>
                </div>
              </div>
            </div>
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:border-[#0F4C6E]/30 hover:bg-[#0F4C6E]/5 transition text-gray-500 hover:text-[#0F4C6E] shrink-0 cursor-pointer"
            >
              <IoShareSocialOutline size={18} />
            </motion.button>
          </div>
        </div>
        {/* Bottom accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#0F4C6E]/15 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
          {/* Images - takes 7 cols on large */}
          <div className="lg:col-span-7">
            <ProductImages images={allImages} name={product.name} discountPercent={product.discountPercent} />
          </div>
          {/* Info - takes 5 cols on large */}
          <div className="lg:col-span-5">
            <ProductInfo
              product={product}
              addedToCart={addedToCart}
              onAddToCart={() => { addItem(product); setAddedToCart(true); }}
            />
          </div>
        </div>
        <ProductDetails installment={product.installment} description={product.description} specs={product.specs} />
      </div>
    </main>
  );
}
