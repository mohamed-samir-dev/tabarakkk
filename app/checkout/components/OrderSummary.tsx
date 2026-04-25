"use client";

import { motion } from "framer-motion";
import { IoReceiptOutline, IoRocketOutline, IoWalletOutline } from "react-icons/io5";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function OrderSummary({ total, downPayment }: { total: number; downPayment: number }) {
  const isPaying = downPayment > 0 ? downPayment : total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F4C6E] to-[#0a3550] rounded-2xl p-5 sm:p-6 text-white shadow-[0_8px_30px_rgba(15,76,110,0.25)]"
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#7CC043]/10 rounded-full blur-xl" />
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-lg" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <IoReceiptOutline size={18} className="text-white/80" />
          </div>
          <h3 className="text-sm font-extrabold">ملخص الطلب</h3>
        </div>

        {/* Rows */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50 font-medium">مجموع السلة</span>
            <span className="text-sm font-bold">{fmt(total)} <span className="text-xs text-white/40">ر.س</span></span>
          </div>

          {downPayment > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50 font-medium">الدفعة الأولى</span>
              <span className="text-sm font-bold text-[#7CC043]">{fmt(downPayment)} <span className="text-xs text-white/40">ر.س</span></span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-white/50">
              <IoRocketOutline size={14} />
              <span className="text-sm font-medium">التوصيل</span>
            </div>
            <span className="text-xs font-bold text-[#7CC043] bg-[#7CC043]/10 px-2.5 py-1 rounded-full">مجاني</span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IoWalletOutline size={18} className="text-[#7CC043]" />
              <span className="font-bold text-sm">المطلوب دفعه الآن</span>
            </div>
            <div className="text-left">
              <span className="text-2xl font-extrabold">{fmt(isPaying)}</span>
              <span className="text-xs text-white/40 mr-1">ر.س</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
