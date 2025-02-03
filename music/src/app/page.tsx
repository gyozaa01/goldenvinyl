"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HomePage from "@/components/HomePage";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  // 3초 후 메인 페이지로 전환
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return showIntro ? (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-amber-900 via-stone-900 to-black">
      <div className="text-center">
        <motion.div
          className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 relative mx-auto mb-6"
          animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -5, 0] }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          {/* LP 디스크 */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-stone-900 to-stone-800">
            <div className="absolute inset-5 sm:inset-6 md:inset-8 rounded-full bg-gradient-to-br from-stone-800 to-stone-700" />
            <div className="absolute inset-[30%] rounded-full bg-amber-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-stone-900" />
            </div>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-stone-800"
                style={{ margin: `${(i + 1) * 4}px` }}
              />
            ))}
          </div>

          {/* LP 바늘 애니메이션 */}
          <motion.div
            className="absolute w-1/2 h-[2px] bg-zinc-400 top-1/2 right-1/2 origin-right"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute right-0 -top-1 w-2 h-2 bg-amber-500 rounded-full"></div>
          </motion.div>
        </motion.div>

        {/* 타이틀 애니메이션 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="eng text-4xl font-bold text-amber-100"
        >
          Golden Vinyl
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="eng kor mt-4 text-amber-200/60"
        >
          LP 감성의 현대적 음악 플레이어
        </motion.div>
      </div>
    </div>
  ) : (
    <HomePage />
  );
}
