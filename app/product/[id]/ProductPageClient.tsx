"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowForward } from "react-icons/io5";
import type { Product } from "../../components/products/types";
import { useCartStore } from "../../store/cartStore";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import ProductDetails from "./components/ProductDetails";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`${API}/api/products/${id}`)
      .then((r) => r.json())
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-lg">جاري التحميل...</p></div>;
  if (!product)
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-lg">المنتج غير موجود</p></div>;

  const resolveImg = (src: string) =>
    src.startsWith("http") ? src : src.startsWith("/uploads") ? src : `${API}${src}`;

  const allImages = (product.images?.length ? product.images : product.image ? [product.image] : []).map(resolveImg);

  return (
    <main className="min-h-screen bg-[#E6F2F8] pb-16" dir="rtl">
      <div className="bg-[#E6F2F8] border-b border-[#B8D8EC] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-[#ddeef7] transition text-[#0F4C6E] shrink-0">
            <IoArrowForward size={20} />
          </button>
          <h1 className="text-xs sm:text-sm font-semibold text-[#0F4C6E] truncate">{product.name}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <ProductImages images={allImages} name={product.name} discountPercent={product.discountPercent} />
          <ProductInfo
            product={product}
            addedToCart={addedToCart}
            onAddToCart={() => { addItem(product); setAddedToCart(true); }}
          />
        </div>
        <ProductDetails installment={product.installment} description={product.description} specs={product.specs} />
      </div>
    </main>
  );
}
