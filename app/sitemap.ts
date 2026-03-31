import { MetadataRoute } from "next";
import { slugConfigs } from "./lib/categoryConfig";

const BASE_URL = "https://tabaraktech.com";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://tabaraktech.com/api/tabarak";

const staticRoutes = [
  "",
  "/smartphones",
  "/apple-watches",
  "/audio",
  "/playstation",
  "/laptops",
  "/tablets",
  "/accessories",
  "/games",
  "/cart",
  "/checkout",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_urls: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
    lastModified: new Date(),
  }));

  const slug_urls: MetadataRoute.Sitemap = Object.keys(slugConfigs).map((slug) => ({
    url: `${BASE_URL}/categories/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: new Date(),
  }));

  let product_urls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const products: { _id: string }[] = await res.json();
      product_urls = products.map((p) => ({
        url: `${BASE_URL}/product/${p._id}`,
        changeFrequency: "daily",
        priority: 0.6,
        lastModified: new Date(),
      }));
    }
  } catch {
    // skip if backend unavailable
  }

  return [...static_urls, ...slug_urls, ...product_urls];
}
