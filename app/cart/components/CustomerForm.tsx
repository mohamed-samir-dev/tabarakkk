"use client";

import { useState, useMemo } from "react";
import type { CustomerInfo } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("en-US");

function InlineField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <label className="text-xs sm:text-sm text-gray-600 font-bold sm:whitespace-nowrap sm:w-36 sm:shrink-0">
          {label} <span className="text-red-400">*</span>
        </label>
        <div className="flex-1">{children}</div>
      </div>
      {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
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
  const MONTHS_OPTIONS = Array.from({ length: installmentMonths ?? 24 }, (_, i) => i + 1);
  const minDownPayment = 1000 * itemCount;
  const DOWN_PAYMENT_OPTIONS = [minDownPayment, minDownPayment + 500, minDownPayment + 1000];
  const [name, setName] = useState(initialData?.name ?? "");
  const [nationalId, setNationalId] = useState(initialData?.nationalId ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [installmentType, setInstallmentType] = useState<"full" | "installment">(initialData?.installmentType ?? "full");
  const [months, setMonths] = useState(initialData?.months ?? 3);
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
      return {
        index: i + 1,
        date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
        amount: monthlyPayment,
      };
    });
  }, [months, monthlyPayment]);

  const inputClass = (field: string) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none transition placeholder:text-gray-400 ${
      errors[field]
        ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
        : "border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
    }`;

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
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 space-y-3">
        <InlineField label="الاسم كاملاً" error={errors.name}>
          <input value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }} placeholder="محمد أحمد" className={inputClass("name")} />
        </InlineField>
        <InlineField label="رقم الهوية / الإقامة" error={errors.nationalId}>
          <input value={nationalId} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setNationalId(v); setErrors((p) => ({ ...p, nationalId: "" })); }} placeholder="10XXXXXXXX" className={inputClass("nationalId")} />
        </InlineField>
        <InlineField label="رقم الواتساب" error={errors.whatsapp}>
          <input type="tel" value={whatsapp} onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
              setWhatsapp(val);
              setErrors((p) => ({ ...p, whatsapp: "" }));
            }} placeholder="05XXXXXXXX" className={inputClass("whatsapp")} />
        </InlineField>
        <InlineField label="العنوان" error={errors.address}>
          <input value={address} onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }} placeholder="المدينة - الحي - الشارع" className={inputClass("address")} />
        </InlineField>

        <div className="border-t border-gray-200 pt-3" />

        <InlineField label=" الدفع/التقسيط علي ">
          <select
            value={installmentType === "full" ? "full" : String(months)}
            onChange={(e) => {
              if (e.target.value === "full") {
                setInstallmentType("full");
              } else {
                setInstallmentType("installment");
                setMonths(Number(e.target.value));
              }
            }}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 bg-white focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300 transition cursor-pointer"
          >
            <option value="full" className="bg-white">سداد المبلغ كاملاً</option>
            {MONTHS_OPTIONS.map((m) => (
              <option key={m} value={m} className="bg-white">تقسيط {m} شهر</option>
            ))}
          </select>
        </InlineField>

        {installmentType === "installment" && (
          <>
            <InlineField label="الدفعة الأولى">
              <select
                value={String(downPaymentExtra)}
                onChange={(e) => setDownPaymentExtra(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 bg-white focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300 transition cursor-pointer"
              >
                {DOWN_PAYMENT_OPTIONS.map((v) => (
                  <option key={v} value={v - minDownPayment} className="bg-white">{fmt(v)} ر.س</option>
                ))}
                <option value={total - minDownPayment} className="bg-white">الدفع بالكامل ({fmt(total)} ر.س)</option>
              </select>
            </InlineField>
            <InlineField label="القسط الشهري">
              <div className="w-full bg-gray-100 border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-extrabold text-[#7CC043]">
                {fmt(monthlyPayment)} ر.س
              </div>
            </InlineField>

            {months > 0 && (
              <div className="rounded-xl overflow-hidden border border-gray-200 mt-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 text-right text-xs sm:text-sm font-bold text-gray-600">#</th>
                      <th className="py-2 px-3 text-right text-xs sm:text-sm font-bold text-gray-600">التاريخ</th>
                      <th className="py-2 px-3 text-right text-xs sm:text-sm font-bold text-gray-600">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row, i) => (
                      <tr key={row.index} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="py-2 px-3 text-gray-400 font-bold text-xs sm:text-sm">{row.index}</td>
                        <td className="py-2 px-3 text-gray-600 text-xs sm:text-sm">{row.date}</td>
                        <td className="py-2 px-3 font-bold text-gray-800 text-xs sm:text-sm">{fmt(row.amount)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-[#7CC043] hover:bg-[#89BA45] active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-[#7CC043]/20"
      >
        التالي
      </button>
    </>
  );
}
