import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaMobileAlt, FaEnvelope } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getCompany() {
  try {
    const r = await fetch(`${API}/api/admin/company`, { next: { revalidate: 60 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export default async function Footer() {
  const c = await getCompany();

  function ensureAbsolute(url: string) {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  }

  function toInlineUrl(url: string) {
    if (!url) return url;
    const rawUrl = url.replace("/image/upload/", "/raw/upload/").replace(/\/fl_attachment:[^/]+\//, "/");
    return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=false`;
  }

  const qrSrc: string = c.qrImage || "";
  const qrLink: string = ensureAbsolute(c.qrLink || "");

  const footerItems: { image: string; linkType: string; link: string; file: string }[] =
    (c.footerItems || []).filter((item: { image: string }) => item.image);

  const img1: string = c.img1 || "";
  const linkType1: string = c.linkType1 || c.link1Type || "link";
  const link1: string = linkType1 === "file" ? toInlineUrl(c.file1 || "") : ensureAbsolute(c.link1 || "");
  const img2: string = c.img2 || "";
  const linkType2: string = c.linkType2 || c.link2Type || "link";
  const link2: string = linkType2 === "file" ? toInlineUrl(c.file2 || "") : ensureAbsolute(c.link2 || "");

  function getHref(item: { linkType: string; link: string; file: string }) {
    return item.linkType === "link" ? ensureAbsolute(item.link) : toInlineUrl(item.file);
  }

  return (
    <footer className="text-gray-100 mt-16" style={{ background: 'linear-gradient(to bottom, #0F4C6E, #0a3550)' }} dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* من نحن */}
        <div>
          <h3 className="text-[#7CC043] font-bold text-xl mb-3">من نحن</h3>
          <p className="text-sm leading-relaxed text-[#E6F2F8]">
            {c.details || "مؤسسة تبارك التقنية الذكية هي اختيارك الأول لشراء أجهزتك بالأقساط داخل السعودية، ضمان موثوق وخدمة محلية."}
          </p>
        </div>

        {/* روابط مهمة */}
        <div>
          <h3 className="text-[#7CC043] font-bold text-xl mb-4">روابط مهمة</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: "عن مؤسسة تبارك التقنية الذكية", href: "/about" },
              { label: "طرق الدفع", href: "/payment" },
              { label: "سياسة الاستبدال والاسترجاع", href: "/return-policy" },
              { label: "سياسة الخصوصية واتفاقية الاستخدام", href: "/privacy" },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="hover:text-[#7CC043] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* تواصل معنا */}
        <div>
          <h3 className="text-[#7CC043] font-bold text-xl mb-4">تواصل معنا</h3>
          <ul className="space-y-2.5 text-sm mb-5">
            {c.whatsapp && (
              <li className="flex items-center gap-2">
                <FaWhatsapp className="text-emerald-500 shrink-0" size={16} />
                <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-[#7CC043] transition-colors" dir="ltr">{c.whatsapp}</a>
              </li>
            )}
            {c.phone && (
              <li className="flex items-center gap-2">
                <FaMobileAlt className="text-emerald-500 shrink-0" size={16} />
                <a href={`tel:${c.phone}`} className="hover:text-[#7CC043] transition-colors" dir="ltr">{c.phone}</a>
              </li>
            )}
            {c.email && (
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-emerald-500 shrink-0" size={16} />
                <a href={`mailto:${c.email}`} className="hover:text-[#7CC043] transition-colors" dir="ltr">{c.email}</a>
              </li>
            )}
          </ul>

          <div className="flex gap-3 flex-wrap items-center">
            {/* QR */}
            {qrSrc && (
              qrLink
                ? <a href={qrLink} target="_blank" rel="noreferrer">
                    <Image src={qrSrc} alt="qr" width={55} height={55} className="object-contain rounded border border-gray-200 bg-white p-1" style={{ width: "auto" }} />
                  </a>
                : <Image src={qrSrc} alt="qr" width={55} height={55} className="object-contain rounded border border-gray-200 bg-white p-1" style={{ width: "auto" }} />
            )}

            {/* Footer Items */}
            {footerItems.map((item, i) => {
              const href = getHref(item);
              const el = (
                <Image key={i} src={item.image} alt={`footer-item-${i}`} width={60} height={40}
                  className="object-contain rounded" style={{ width: 60, height: 40 }} />
              );
              return href
                ? <a key={i} href={href} target="_blank" rel="noreferrer">{el}</a>
                : <span key={i}>{el}</span>;
            })}

            {/* img1 */}
            {img1 && (
              link1
                ? <a href={link1} target="_blank" rel="noreferrer">
                    <Image src={img1} alt="img1" width={90} height={60} className="object-contain rounded" style={{ width: 90, height: 60 }} />
                  </a>
                : <Image src={img1} alt="img1" width={90} height={60} className="object-contain rounded" style={{ width: 90, height: 60 }} />
            )}

            {/* img2 */}
            {img2 && (
              link2
                ? <a href={link2} target="_blank" rel="noreferrer">
                    <Image src={img2} alt="img2" width={90} height={60} className="object-contain rounded" style={{ width: 90, height: 60 }} />
                  </a>
                : <Image src={img2} alt="img2" width={90} height={60} className="object-contain rounded" style={{ width: 90, height: 60 }} />
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#1F6F8B] flex items-center justify-between max-w-6xl mx-auto px-4 py-4 text-xs text-[#E6F2F8]">
        <span>الحقوق محفوظة مؤسسة تبارك التقنية الذكية © 2026</span>
        <div className="flex gap-2">
          <Image src="/cc975b.png" alt="cc" width={50} height={30} className="object-contain" style={{ width: "auto" }} />
          <Image src="/mada975b.png" alt="mada" width={50} height={30} className="object-contain" style={{ width: "auto" }} />
        </div>
      </div>
    </footer>
  );
}
