"use client";

import { useEffect, useState } from "react";
import CategoryLayout from "../../components/products/CategoryLayout";
import type { Product } from "../../components/products/types";

export default function SmartphonesClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        const filtered = data.filter((p) =>
          p.category?.includes("ايفون") ||
          p.category?.includes("جالكسي") ||
          p.category?.includes("جالاكسي") ||
          p.category?.toLowerCase().includes("iphone") ||
          p.category?.toLowerCase().includes("samsung")
        );
        const parseStorage = (s?: string) => {
          if (!s) return 0;
          const n = parseFloat(s);
          if (s.includes("تيرا") || s.toLowerCase().includes("tb")) return n * 1024;
          return n || 0;
        };
        const colorOrder = (c?: string) => {
          if (!c) return 99;
          if (c.includes("برتقال") || c.toLowerCase().includes("orange")) return 0;
          if (c.includes("سيلفر") || c.toLowerCase().includes("silver")) return 1;
          if (c.includes("ازرق") || c.includes("أزرق") || c.toLowerCase().includes("blue")) return 2;
          return 3;
        };
        const sorted = [...filtered].sort((a, b) => {
          const storageDiff = parseStorage(a.storage) - parseStorage(b.storage);
          if (storageDiff !== 0) return storageDiff;
          return colorOrder(a.color) - colorOrder(b.color);
        });
        setProducts(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return <CategoryLayout title="الهواتف الذكية" parentLabel="الهواتف الذكية" products={products} loading={loading} emptyIcon="📱" />;
}
