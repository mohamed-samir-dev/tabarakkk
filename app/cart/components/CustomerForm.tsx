"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoPersonOutline, IoCardOutline, IoCallOutline, IoLocationOutline, IoCalendarOutline, IoWalletOutline, IoChevronDown, IoCashOutline, IoLayersOutline } from "react-icons/io5";
import type { CustomerInfo } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("en-US");

function Field({ label, icon, error, children }: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
        {icon}
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs font-bold">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CustomerFormProps {
  total: number;
  itemCount: number;
  initialData?: CustomerInfo | null;
  installmentMonths?: number;
  onSubmit: (info: CustomerInfo) => void;
}

export default function CustomerForm({ total, itemCount, initialData, installmentMonths, onSubmit }: CustomerFormProps) {
  const maxMonths = installmentMonths ?? 24;
  const MONTHS_OPTIONS = Array.from({ length: maxMonths }, (_, i) => i + 1);
  const minDownPayment = 1000 * itemCount;
  const DOWN_PAYMENT_OPTIONS = [minDownPayment, minDownPayment + 500, minDownPayment + 1000];
  const [name, setName] = useState(initialData?.name ?? "");
  const [nationalId, setNationalId] = useState(initialData?.nationalId ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [installmentType, setInstallmentType] = useState<"full" | "installment">(initialData?.installmentType ?? "installment");
  const [months, setMonths] = useState(initialData?.months ?? maxMonths);
  const [downPaymentExtra, setDownPaymentExtra] = useState<number>(0);
  const downPayment = minDownPayment + downPaymentExtra;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const monthlyPayment = useMemo(() => {
    if (installmentType === "full") return 0;
    const remaining = total - downPayment;
    return remaining > 0 ? Math.ceil(remaining / months) : 0;
  }, [total, months, installmentType, downPayment]);

  const schedule = useMemo(() => {
    const now = new Date();
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, now.getDate());
      return { index: i + 1, date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, amount: monthlyPayment };
    });
  }, [months, monthlyPayment]);

  const inputClass = (field: string) =>
    `w-full rounded-xl px-4 py-3 text-sm text-gray-800 bg-gray-50/80 border focus:outline-none transition-all duration-200 placeholder:text-gray-300 ${
      errors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30"
        : "border-gray-200/80 focus:border-[#0F4C6E] focus:ring-2 focus:ring-[#0F4C6E]/10 focus:bg-white"
    }`;

  const selectClass = "w-full rounded-xl px-4 py-3 text-sm font-bold text-gray-800 bg-gray-50/80 border border-gray-200/80 focus:outline-none focus:border-[#0F4C6E] focus:ring-2 focus:ring-[#0F4C6E]/10 focus:bg-white transition-all duration-200 cursor-pointer appearance-none";

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "مطلوب";
    if (!nationalId.trim()) newErrors.nationalId = "مطلوب";
    if (!whatsapp.trim()) newErrors.whatsapp = "مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim())) newErrors.whatsapp = "رقم غير صحيح، يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!address.trim()) newErrors.address = "مطلوب";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit({ name, nationalId, whatsapp, address, installmentType, months, downPayment });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
      {/* Customer Info Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 space-y-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C6E]/5 flex items-center justify-center">
            <IoPersonOutline size={16} className="text-[#0F4C6E]" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-800">بيانات العميل</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="الاسم كاملاً" icon={<IoPersonOutline size={12} className="text-[#0F4C6E]" />} error={errors.name}>
            <input value={name} onChange={(e) => { setName(e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "")); setErrors((p) => ({ ...p, name: "" })); }} placeholder="محمد أحمد" className={inputClass("name")} />
          </Field>
          <Field label="رقم الهوية / الإقامة" icon={<IoCardOutline size={12} className="text-[#0F4C6E]" />} error={errors.nationalId}>
            <input value={nationalId} onChange={(e) => { setNationalId(e.target.value.replace(/[^0-9]/g, "")); setErrors((p) => ({ ...p, nationalId: "" })); }} placeholder="10XXXXXXXX" className={inputClass("nationalId")} />
          </Field>
          <Field label="رقم الواتساب" icon={<IoCallOutline size={12} className="text-[#0F4C6E]" />} error={errors.whatsapp}>
            <input type="tel" value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value.replace(/[^0-9]/g, "").slice(0, 10)); setErrors((p) => ({ ...p, whatsapp: "" })); }} placeholder="05XXXXXXXX" className={inputClass("whatsapp")} />
          </Field>
          <Field label="العنوان" icon={<IoLocationOutline size={12} className="text-[#0F4C6E]" />} error={errors.address}>
            <input value={address} onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }} placeholder="المدينة - الحي - الشارع" className={inputClass("address")} />
          </Field>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 space-y-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-[#7CC043]/10 flex items-center justify-center">
            <IoWalletOutline size={16} className="text-[#7CC043]" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-800">طريقة الدفع</h3>
        </div>

        {/* Payment Type Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setInstallmentType("installment")}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              installmentType === "installment"
                ? "border-[#0F4C6E] bg-[#0F4C6E]/5 shadow-[0_0_0_1px_rgba(15,76,110,0.1)]"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {installmentType === "installment" && (
              <motion.div layoutId="paymentCheck" className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-[#0F4C6E] rounded-full flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.div>
            )}
            <IoLayersOutline size={22} className={installmentType === "installment" ? "text-[#0F4C6E]" : "text-gray-400"} />
            <span className={`text-xs font-bold ${installmentType === "installment" ? "text-[#0F4C6E]" : "text-gray-500"}`}>تقسيط</span>
          </button>
          <button
            onClick={() => setInstallmentType("full")}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              installmentType === "full"
                ? "border-[#7CC043] bg-[#7CC043]/5 shadow-[0_0_0_1px_rgba(124,192,67,0.1)]"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {installmentType === "full" && (
              <motion.div layoutId="paymentCheck" className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-[#7CC043] rounded-full flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.div>
            )}
            <IoCashOutline size={22} className={installmentType === "full" ? "text-[#7CC043]" : "text-gray-400"} />
            <span className={`text-xs font-bold ${installmentType === "full" ? "text-[#7CC043]" : "text-gray-500"}`}>كاش كامل</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {installmentType === "installment" ? (
            <motion.div key="installment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-4">
              {/* Months Selector */}
              <Field label="عدد الأشهر" icon={<IoCalendarOutline size={12} className="text-[#0F4C6E]" />}>
                <div className="relative">
                  <select
                    value={String(months)}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className={selectClass}
                  >
                    {MONTHS_OPTIONS.map((m) => (<option key={m} value={m}>{m} شهر</option>))}
                  </select>
                  <IoChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              {/* Down Payment */}
              <Field label="الدفعة الأولى" icon={<IoWalletOutline size={12} className="text-[#0F4C6E]" />}>
                <div className="relative">
                  <select value={String(downPaymentExtra)} onChange={(e) => setDownPaymentExtra(Number(e.target.value))} className={selectClass}>
                    {DOWN_PAYMENT_OPTIONS.map((v) => (<option key={v} value={v - minDownPayment}>{fmt(v)} ر.س</option>))}
                    <option value={total - minDownPayment}>الدفع بالكامل ({fmt(total)} ر.س)</option>
                  </select>
                  <IoChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              {/* Monthly Payment Highlight */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#0F4C6E] to-[#0a3550] rounded-xl p-4">
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#7CC043]/10 rounded-full -translate-x-8 -translate-y-8" />
                <div className="relative">
                  <p className="text-xs text-white/50 font-bold mb-1">القسط الشهري</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-white">{fmt(monthlyPayment)}</span>
                    <span className="text-sm font-medium text-white/40">ر.س / شهر</span>
                  </div>
                </div>
              </div>

              {/* Schedule Table */}
              {months > 0 && (
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <div className="max-h-64 overflow-y-auto scrollbar-hide">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-gradient-to-r from-[#0F4C6E] to-[#1a6b5a]">
                          <th className="py-2.5 px-3 text-right text-xs font-bold text-white/80">#</th>
                          <th className="py-2.5 px-3 text-right text-xs font-bold text-white/80">التاريخ</th>
                          <th className="py-2.5 px-3 text-right text-xs font-bold text-white/80">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((row, i) => (
                          <tr key={row.index} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#0F4C6E]/[0.02] transition-colors`}>
                            <td className="py-2.5 px-3 text-gray-400 font-bold text-xs">{row.index}</td>
                            <td className="py-2.5 px-3 text-gray-600 text-xs">{row.date}</td>
                            <td className="py-2.5 px-3 font-bold text-[#0F4C6E] text-xs">{fmt(row.amount)} ر.س</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <div className="relative overflow-hidden bg-gradient-to-br from-[#7CC043] to-[#5a9e2e] rounded-xl p-5 text-center">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full translate-x-10 -translate-y-10" />
                <div className="relative">
                  <IoCashOutline size={28} className="text-white/70 mx-auto mb-2" />
                  <p className="text-xs text-white/60 font-bold mb-1">المبلغ المطلوب</p>
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-3xl font-extrabold text-white">{fmt(total)}</span>
                    <span className="text-sm font-medium text-white/50">ر.س</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        className="w-full relative overflow-hidden bg-gradient-to-r from-[#0F4C6E] to-[#1a6b5a] text-white font-bold py-4 rounded-2xl text-sm shadow-[0_8px_30px_rgba(15,76,110,0.3)] hover:shadow-[0_12px_40px_rgba(15,76,110,0.4)] transition-shadow duration-300"
      >
        <span className="relative z-10">متابعة الطلب</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
      </motion.button>
    </motion.div>
  );
}
