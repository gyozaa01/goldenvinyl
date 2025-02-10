"use client";

import { useRef } from "react";
import Image from "next/image";

interface VinylDiscProps {
  isPlaying: boolean;
  imageUrl?: string;
  alt?: string;
}

const VinylDisc: React.FC<VinylDiscProps> = ({ isPlaying, imageUrl, alt }) => {
  const vinylRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex flex-col items-center mt-4">
      {/* LP 디스크 */}
      <div className="relative flex items-center justify-center">
        <div
          ref={vinylRef}
          className={`relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-full bg-gradient-to-br from-stone-900 to-stone-800 ${
            isPlaying ? "animate-spin-slow" : ""
          }`}
        >
          {/* 디스크 안쪽 원 */}
          <div className="absolute inset-5 sm:inset-6 md:inset-8 rounded-full bg-gradient-to-br from-stone-800 to-stone-700" />
          <div className="absolute inset-1/5 relative w-full h-full rounded-full bg-amber-500/20 flex items-center justify-center">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={alt || "Album Cover"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-full"
                priority
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-stone-900" />
            )}
          </div>

          {/* LP 디스크 링 효과 */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-stone-800"
              style={{
                margin: `${(i + 1) * 4}px`,
              }}
            />
          ))}
        </div>

        {/* 턴테이블 바늘 */}
        <div
          className="absolute w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44 h-2 flex items-center"
          style={{
            top: "-13%",
            right: "5%",
            transform: isPlaying ? "rotate(-25deg)" : "rotate(10deg)",
            transition: "transform 0.5s ease-in-out",
            transformOrigin: "right center",
          }}
        >
          <div className="w-full h-1 bg-gradient-to-r from-stone-700 to-stone-600" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
        </div>
      </div>
    </div>
  );
};

export default VinylDisc;
