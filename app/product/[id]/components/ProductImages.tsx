"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImagesProps {
  images: string[];
  name: string;
  discountPercent?: number;
}

export default function ProductImages({ images, name, discountPercent = 0 }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="bg-white rounded-2xl  p-3 sm:p-6">
      <div className="relative aspect-square bg-white rounded-xl overflow-hidden">
        {discountPercent > 0 && (
          <span className="absolute z-10 top-2 right-2 bg-red-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
            {discountPercent}%-
          </span>
        )}
        {images.length > 0 ? (
          <Image src={images[selectedImage]} alt={name} fill className="object-contain p-3 sm:p-6" priority sizes="(max-width: 1024px) 100vw, 50vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl sm:text-7xl">📱</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 justify-center flex-wrap">
          {images.map((img, i) => (
            <button key={i} onClick={() => setSelectedImage(i)} className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition ${i === selectedImage ? "border-[#0F4C6E]" : "border-[#B8D8EC] hover:border-[#1F6F8B]"}`}>
              <Image src={img} alt="" fill className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
