import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import imovel1 from "@/assets/imovel-1.jpeg";
import imovel2 from "@/assets/imovel-2.jpeg";
import imovel3 from "@/assets/imovel-3.jpeg";
import imovel4 from "@/assets/imovel-4.jpeg";
import imovel5 from "@/assets/imovel-5.jpeg";
import imovel6 from "@/assets/imovel-6.jpeg";
import imovel7 from "@/assets/imovel-7.jpeg";

const images = [imovel1, imovel2, imovel3, imovel4, imovel5, imovel6, imovel7];

export function PropertyCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <div className="w-full mb-8 md:mb-12">
      {/* Main image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg border border-border">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt={`Imóvel comercial - foto ${current + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-background/60 backdrop-blur-sm border border-border rounded-full text-foreground hover:bg-background/80 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-background/60 backdrop-blur-sm border border-border rounded-full text-foreground hover:bg-background/80 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-background/60 backdrop-blur-sm border border-border rounded-full px-3 py-1">
          <span className="text-[10px] tracking-[0.15em] uppercase text-foreground">
            {current + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-primary w-4" : "bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
