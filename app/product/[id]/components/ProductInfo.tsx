"use client";

import { useRouter } from "next/navigation";
import { IoCartOutline, IoCheckmarkCircle, IoShieldCheckmark, IoTimeOutline, IoCarOutline, IoCheckmarkDoneCircle } from "react-icons/io5";
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
  const hasDiscount = salePrice && salePrice < originalPrice;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="bg-white rounded-2xl border border-[#B8D8EC] p-3 sm:p-5">
        {brand && <span className="text-xs sm:text-sm text-[#7CC043] font-semibold">{brand}</span>}
        <h2 className="text-base sm:text-xl font-bold text-gray-800 mt-1 leading-relaxed">{name}</h2>
        {(color || storage || network) && (
          <div className="flex gap-2 mt-2 sm:mt-3 flex-wrap">
            {[color, storage, network].filter(Boolean).map((t, i) => (
              <span key={i} className="text-xs bg-[#E6F2F8] text-[#0F4C6E] px-2 sm:px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#B8D8EC] p-3 sm:p-5">
        <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
          {hasDiscount ? (
            <>
              <span className="text-xl sm:text-2xl font-extrabold text-red-600">{fmt(salePrice)} ر.س</span>
              <span className="text-sm sm:text-base text-gray-400 line-through">{fmt(originalPrice)} ر.س</span>
              <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded">وفّر {fmt(originalPrice - salePrice)} ر.س</span>
            </>
          ) : (
            <span className="text-xl sm:text-2xl font-extrabold text-red-600">{fmt(originalPrice)} ر.س</span>
          )}
        </div>
        {taxIncluded && <p className="text-xs text-gray-400 mt-1.5">شامل الضريبة</p>}
        {installment?.available && (
          <p className="text-xs sm:text-sm text-[#7CC043] mt-2 font-medium">
            💳 تقسيط متاح {installment.downPayment ? `- مقدم ${fmt(installment.downPayment)} ر.س` : ""} {installment.note || ""}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl border border-[#B8D8EC] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <IoCarOutline size={18} className="text-[#7CC043] shrink-0" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{freeDelivery ? "توصيل مجاني" : "توصيل مدفوع"}</p>
            {deliveryTime && <p className="text-[10px] sm:text-xs text-gray-400 truncate">{deliveryTime}</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#B8D8EC] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <IoShieldCheckmark size={18} className="text-[#7CC043] shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-gray-700">ضمان حاسبات العرب سنتين    </p>
        </div>
        <div className="bg-white rounded-xl border border-[#B8D8EC] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <IoCheckmarkCircle size={18} className={inStock ? "text-[#7CC043]" : "text-red-400"} />
          <p className="text-xs sm:text-sm font-semibold text-gray-700">{inStock ? "متوفر" : "غير متوفر"}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#B8D8EC] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <IoTimeOutline size={18} className="text-[#7CC043] shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-gray-700">شحن سريع</p>
        </div>
      </div>

      {!addedToCart ? (
        <button
          onClick={onAddToCart}
          className="w-full bg-[#0F4C6E] hover:bg-[#0a3550] text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <IoCartOutline size={20} />
          أضف للسلة
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 text-[#5a9030] bg-[#eaf5d8] py-2.5 rounded-xl">
            <IoCheckmarkDoneCircle size={18} />
            <span className="text-xs sm:text-sm font-bold">تمت الإضافة للسلة بنجاح ✓</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => router.back()}
              className="bg-[#E6F2F8] hover:bg-[#ddeef7] text-[#0F4C6E] font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl transition-colors"
            >
              متابعة التسوق
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="bg-[#0F4C6E] hover:bg-[#0a3550] text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <IoCartOutline size={16} />
              السلة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
