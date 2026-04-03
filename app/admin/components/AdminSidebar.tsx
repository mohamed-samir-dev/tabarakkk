"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "الرئيسية" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/users", label: "المستخدمون" },
  { href: "/admin/main-categories", label: "التصنيفات" },
  { href: "/admin/sub-categories", label: "التصنيفات الفرعية" },
  { href: "/admin/banners", label: "البانرات" },
  { href: "/admin/reviews", label: "التقييمات" },
  { href: "/admin/banks", label: "البنوك" },
  { href: "/admin/company", label: "الشركة" },
  { href: "/admin/files", label: "الملفات" },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 right-0 z-40 h-full w-64 bg-white border-l border-gray-200 pt-16 transition-transform duration-200
        ${open ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}
    >
      <nav className="flex flex-col gap-1 p-3">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${pathname.startsWith(href) ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
