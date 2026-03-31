import { IoCheckmarkCircle } from "react-icons/io5";
import type { Product } from "../../../components/products/types";

const fmt = (n: number) => n.toLocaleString("ar-SA");

const specLabels: [keyof NonNullable<Product["specs"]>, string][] = [
  ["screen", "الشاشة"], ["processor", "المعالج"], ["ram", "الرام"], ["storage", "التخزين"],
  ["rearCamera", "الكاميرا الخلفية"], ["frontCamera", "الكاميرا الأمامية"],
  ["battery", "البطارية"], ["batteryLife", "عمر البطارية"], ["charging", "الشحن"],
  ["os", "نظام التشغيل"], ["extras", "مميزات إضافية"],
];

interface ProductDetailsProps {
  installment?: Product["installment"];
  description?: string;
  specs?: Product["specs"];
}

export default function ProductDetails({ installment, description, specs }: ProductDetailsProps) {
  return (
    <>
      {installment?.available && (
        <div className="bg-white rounded-2xl border border-[#B8D8EC] p-3 sm:p-5 mt-4 sm:mt-6">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 sm:mb-4">💳 التقسيط</h3>
          <div className="bg-[#eaf5d8] rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-semibold text-[#5a9030]">
              احصل عليه بأقساط شهرية
              {installment.downPayment ? ` تبدأ بدفعة ${fmt(installment.downPayment)} ر.س والباقي أقساط` : ""}
            </p>
            {installment.note && <p className="text-xs text-[#7CC043] mt-1">{installment.note}</p>}
          </div>
          {installment.policy && (
            <div className="text-center mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-bold text-amber-600">♕ {installment.policy} ♕</span>
            </div>
          )}
          {installment.conditions && installment.conditions.length > 0 && (
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">الشروط الواجب توفرها للتقديم</p>
              <div className="flex flex-col gap-2">
                {installment.conditions.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                    <IoCheckmarkCircle size={14} className="text-[#7CC043] shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {description && (
        <div className="bg-white rounded-2xl border border-[#B8D8EC] p-3 sm:p-5 mt-4 sm:mt-6">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">الوصف</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
        </div>
      )}

      {specs && Object.values(specs).some(Boolean) && (
        <div className="bg-white rounded-2xl border border-[#B8D8EC] p-3 sm:p-5 mt-3 sm:mt-4">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3">المواصفات</h3>
          <div className="rounded-xl overflow-hidden border border-[#B8D8EC]">
            {specLabels.map(([key, label], i) =>
              specs[key] ? (
                <div key={key} className={`flex text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 ${i % 2 === 0 ? "bg-[#E6F2F8]" : "bg-white"}`}>
                  <span className="text-gray-400 w-24 sm:w-36 shrink-0">{label}</span>
                  <span className="text-gray-700 flex-1 min-w-0 wrap-break-word">{specs[key]}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </>
  );
}
