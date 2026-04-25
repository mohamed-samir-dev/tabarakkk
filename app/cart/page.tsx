"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IoCartOutline, IoChevronBack, IoBagCheckOutline, IoRocketOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { useCartStore } from "../store/cartStore";
import type { CustomerInfo } from "../store/cartStore";
import CartItem from "./components/CartItem";
import CustomerForm from "./components/CustomerForm";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, totalPrice, totalItems, setCustomer, customer } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const total = mounted ? totalPrice() : 0;
  const count = mounted ? totalItems() : 0;
  const installmentMonths = mounted ? Math.max(...items.map((i) => i.product.installment?.months ?? 0)) || undefined : undefined;

  if (!mounted) return null;

  /* ── Empty State ── */
  if (items.length === 0)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-gradient-to-b from-gray-50 to-white" dir="rtl">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="w-28 h-28 bg-gradient-to-br from-[#0F4C6E]/10 to-[#7CC043]/10 rounded-full flex items-center justify-center shadow-[0_8px_40px_rgba(15,76,110,0.1)]">
            <IoCartOutline size={48} className="text-[#0F4C6E]/40" />
          </div>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center">
          <p className="text-gray-800 text-xl font-extrabold">السلة فارغة</p>
          <p className="text-gray-400 text-sm mt-2">لم تضف أي منتجات بعد</p>
        </motion.div>
        <motion.button
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-[#0F4C6E] to-[#1a6b5a] text-white px-10 py-3.5 rounded-full font-bold text-sm shadow-[0_8px_30px_rgba(15,76,110,0.3)]"
        >
          تصفح المنتجات
        </motion.button>
      </main>
    );

  /* ── Cart with Items ── */
  return (
    <main className="min-h-screen pb-8 bg-gradient-to-b from-gray-50/80 to-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
              <IoChevronBack size={18} className="text-gray-600 rotate-180" />
            </Link>
            <div>
              <h1 className="text-[15px] font-extrabold text-gray-800">سلة التسوق</h1>
              <p className="text-[11px] text-gray-400 font-medium">{count} منتج</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0F4C6E]/5 px-3 py-1.5 rounded-full">
            <IoBagCheckOutline size={14} className="text-[#0F4C6E]" />
            <span className="text-xs font-bold text-[#0F4C6E]">{fmt(total)} ر.س</span>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-3 space-y-3">
            <AnimatePresence>
              {items.map(({ product, qty }, i) => (
                <CartItem key={product._id} product={product} qty={qty} index={i} onUpdateQty={updateQty} onRemove={removeItem} />
              ))}
            </AnimatePresence>

            {/* Order Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: items.length * 0.08 + 0.1 }}
              className="bg-gradient-to-br from-[#0F4C6E] to-[#0a3550] rounded-2xl p-4 sm:p-5 text-white shadow-[0_8px_30px_rgba(15,76,110,0.2)]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-medium">المجموع</span>
                  <span className="font-bold">{fmt(total)} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-medium">التوصيل</span>
                  <span className="text-[#7CC043] font-bold text-xs flex items-center gap-1">
                    <IoRocketOutline size={12} /> مجاني
                  </span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="font-bold text-sm">الإجمالي</span>
                  <span className="text-xl font-extrabold">{fmt(total)} <span className="text-xs font-medium text-white/50">ر.س</span></span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 text-white/40">
                  <IoShieldCheckmarkOutline size={14} />
                  <span className="text-[10px] font-medium">دفع آمن</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5 text-white/40">
                  <IoRocketOutline size={14} />
                  <span className="text-[10px] font-medium">توصيل سريع</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Customer Form */}
          <div className="lg:col-span-2">
            <CustomerForm
              total={total}
              itemCount={count}
              initialData={customer}
              installmentMonths={installmentMonths}
              onSubmit={(info: CustomerInfo) => {
                setCustomer(info);
                router.push("/checkout");
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
