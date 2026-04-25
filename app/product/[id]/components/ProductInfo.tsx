"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoCartOutline,
  IoCheckmarkCircle,
  IoShieldCheckmark,
  IoCarOutline,
  IoCheckmarkDoneCircle,
  IoFlashOutline,
} from "react-icons/io5";
import type { Product } from "../../../components/products/types";

const fmt = (n: number) => n.toLocaleString("en-US");

interface ProductInfoProps {
  product: Product;
  addedToCart: boolean;
  onAddToCart: () => void;
}

export default function ProductInfo({ product, addedToCart, onAddToCart }: ProductInfoProps) {
  const router = useRouter();
  const { name, brand, color, storage, network, salePrice, taxIncluded, installment, freeDelivery, deliveryTime, inStock } = product;
  const originalPrice = product.originalPrice ?? 0;
  const hasDiscount = salePrice != null && salePrice !== originalPrice;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:sticky lg:top-20">
      {/* Name & Brand card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 product-card-shadow">
        {brand && (
          <span className="inline-block text-xs font-bold text-[#7CC043] bg-[#7CC043]/10 px-3 py-1 rounded-full mb-2">
            {brand}
          </span>
        )}
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-relaxed">{name}</h2>
        {(color || storage || network) && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {[color, storage, network].filter(Boolean).map((t, i) => (
              <span key={i} className="text-xs bg-[#0F4C6E]/5 text-[#0F4C6E] px-3 py-1.5 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 product-card-shadow">
        <div className="flex items-end gap-3 flex-wrap">
          {hasDiscount ? (
            <>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0F4C6E]">{fmt(salePrice)} <span className="text-base font-bold">ر.س</span></span>
              <span className="text-sm text-gray-400 line-through mb-1">{fmt(originalPrice)} ر.س</span>
            </>
          ) : (
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F4C6E]">{fmt(originalPrice)} <span className="text-base font-bold">ر.س</span></span>
          )}
        </div>
        {hasDiscount && (
          <div className="mt-2">
            <span className="text-xs bg-red-50 text-red-500 font-bold px-3 py-1 rounded-full">
              وفّر {fmt(originalPrice - (salePrice ?? 0))} ر.س 🔥
            </span>
          </div>
        )}
        {taxIncluded && <p className="text-[11px] text-gray-400 mt-2">شامل الضريبة</p>}
        {installment?.available && (
          <div className="mt-3 bg-gradient-to-r from-[#7CC043]/10 to-[#5FA32E]/5 rounded-xl px-3 py-2.5">
            <p className="text-xs sm:text-sm text-[#5a9030] font-semibold">
              💳 تقسيط متاح {installment.downPayment ? `- مقدم ${fmt(installment.downPayment)} ر.س` : ""} {installment.note || ""}
            </p>
          </div>
        )}
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {[
          { icon: <IoCarOutline size={20} />, title: freeDelivery ? "توصيل مجاني" : "توصيل مدفوع", sub: deliveryTime, color: "#0F4C6E" },
          { icon: <IoShieldCheckmark size={20} />, title: "ضمان سنتين", sub: "حاسبات العرب", color: "#7CC043" },
          { icon: <IoCheckmarkCircle size={20} />, title: inStock ? "متوفر" : "غير متوفر", sub: inStock ? "جاهز للشحن" : "", color: inStock ? "#7CC043" : "#ef4444" },
          { icon: <IoFlashOutline size={20} />, title: "شحن سريع", sub: "توصيل فوري", color: "#f59e0b" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 product-card-shadow flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}12`, color: item.color }}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{item.title}</p>
              {item.sub && <p className="text-[10px] sm:text-xs text-gray-400 truncate">{item.sub}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add to cart */}
      <AnimatePresence mode="wait">
        {!addedToCart ? (
          <motion.button
            key="add"
            onClick={onAddToCart}
            className="w-full bg-gradient-to-r from-[#0F4C6E] to-[#1F6F8B] hover:from-[#0a3550] hover:to-[#0F4C6E] text-white font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-[#0F4C6E]/20 cursor-pointer"
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <IoCartOutline size={22} />
            أضف للسلة
          </motion.button>
        ) : (
          <motion.div
            key="added"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-center gap-2 text-[#5a9030] bg-gradient-to-r from-[#eaf5d8] to-[#f0f9e8] py-3 rounded-2xl">
              <IoCheckmarkDoneCircle size={20} />
              <span className="text-sm font-bold">تمت الإضافة للسلة بنجاح ✓</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => router.back()}
                className="bg-[#0F4C6E]/5 hover:bg-[#0F4C6E]/10 text-[#0F4C6E] font-bold text-xs sm:text-sm py-3 rounded-xl transition-colors"
              >
                متابعة التسوق
              </button>
              <button
                onClick={() => router.push("/cart")}
                className="bg-gradient-to-r from-[#0F4C6E] to-[#1F6F8B] text-white font-bold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#0F4C6E]/15"
              >
                <IoCartOutline size={16} />
                السلة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
