"use client";

import { useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "../../../components/products/types";

const fmt = (n: number) => n.toLocaleString("ar-SA");

const specLabels: [keyof NonNullable<Product["specs"]>, string, string][] = [
  ["screen", "الشاشة", "📱"], ["processor", "المعالج", "⚡"], ["ram", "الرام", "🧠"], ["storage", "التخزين", "💾"],
  ["rearCamera", "الكاميرا الخلفية", "📸"], ["frontCamera", "الكاميرا الأمامية", "🤳"],
  ["battery", "البطارية", "🔋"], ["batteryLife", "عمر البطارية", "⏱️"], ["charging", "الشحن", "🔌"],
  ["os", "نظام التشغيل", "💻"], ["extras", "مميزات إضافية", "✨"],
];

interface ProductDetailsProps {
  installment?: Product["installment"];
  description?: string;
  specs?: Product["specs"];
}

type Tab = "specs" | "description" | "installment";

export default function ProductDetails({ installment, description, specs }: ProductDetailsProps) {
  const hasSpecs = specs && Object.values(specs).some(Boolean);
  const hasInstallment = installment?.available;

  const tabs: { id: Tab; label: string }[] = [
    ...(hasSpecs ? [{ id: "specs" as Tab, label: "المواصفات" }] : []),
    ...(description ? [{ id: "description" as Tab, label: "الوصف" }] : []),
    ...(hasInstallment ? [{ id: "installment" as Tab, label: "التقسيط" }] : []),
  ];

  const [active, setActive] = useState<Tab>(tabs[0]?.id ?? "specs");

  if (!tabs.length) return null;

  return (
    <div className="mt-6 sm:mt-10 bg-white rounded-2xl sm:rounded-3xl product-card-shadow overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-2 sm:px-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`relative px-4 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              active === tab.id ? "text-[#0F4C6E]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0F4C6E] to-[#1F6F8B] rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {active === "specs" && hasSpecs && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {specLabels.map(([key, label, emoji]) =>
                specs[key] ? (
                  <div
                    key={key}
                    className="flex items-center text-xs sm:text-sm px-3 sm:px-4 py-3 rounded-xl even:bg-[#f8fbfd] odd:bg-white"
                  >
                    <span className="ml-2 text-sm">{emoji}</span>
                    <span className="text-gray-400 w-28 sm:w-36 shrink-0 font-medium">{label}</span>
                    <span className="text-gray-800 flex-1 min-w-0 break-words font-semibold">{specs[key]}</span>
                  </div>
                ) : null
              )}
            </motion.div>
          )}

          {active === "description" && description && (
            <motion.div
              key="desc"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Description cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {description.split("\n").filter(Boolean).map((paragraph, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="group relative rounded-2xl p-4 bg-gradient-to-br from-[#f8fbfd] to-white border border-[#e8f1f6] hover:border-[#0F4C6E]/20 hover:shadow-md hover:shadow-[#0F4C6E]/5 transition-all duration-300"
                  >
                    {/* Accent bar */}
                    <div className="absolute top-4 right-0 w-[3px] h-6 rounded-l-full bg-gradient-to-b from-[#0F4C6E] to-[#7CC043] group-hover:h-8 transition-all duration-300" />
                    <div className="flex items-start gap-3 pr-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F4C6E]/8 to-[#7CC043]/8 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xs">{["📌", "💡", "🔍", "⭐", "📋", "🎯", "✅", "📦", "🏷️", "💎"][i % 10]}</span>
                      </div>
                      <p className="text-[13px] sm:text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">{paragraph}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {active === "installment" && hasInstallment && (
            <motion.div
              key="installment"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-[#eaf5d8] to-[#f0f9e8] rounded-2xl p-4 sm:p-5">
                <p className="text-sm sm:text-base font-bold text-[#5a9030]">
                  احصل عليه بأقساط شهرية
                  {installment.downPayment ? ` تبدأ بدفعة ${fmt(installment.downPayment)} ر.س والباقي أقساط` : ""}
                </p>
                {installment.note && <p className="text-xs text-[#7CC043] mt-1.5">{installment.note}</p>}
              </div>
              {installment.policy && (
                <div className="text-center py-2">
                  <span className="text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-full">♕ {installment.policy} ♕</span>
                </div>
              )}
              {installment.conditions && installment.conditions.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">الشروط الواجب توفرها للتقديم</p>
                  <div className="flex flex-col gap-2.5">
                    {installment.conditions.map((c, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <IoCheckmarkCircle size={16} className="text-[#7CC043] shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
