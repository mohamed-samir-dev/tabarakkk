const fmt = (n: number) => n.toLocaleString("en-US");

export default function OrderSummary({ total, downPayment }: { total: number; downPayment: number }) {
  return (
    <div className="bg-[#0a3550]/80 backdrop-blur-sm border border-[#1F6F8B] rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#1F6F8B]">
        <span className="text-xs sm:text-sm text-[#B8D8EC] font-medium">مجموع السلة</span>
        <span className="text-xs sm:text-sm font-semibold text-white">{fmt(total)} ريـــال</span>
      </div>
      <div className="flex justify-between items-center px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#1F6F8B]">
        <span className="text-xs sm:text-sm text-[#B8D8EC] font-medium">الدفعة الأولى</span>
        <span className="text-xs sm:text-sm font-semibold text-white">{fmt(downPayment)} ريـــال</span>
      </div>
    </div>
  );
}
