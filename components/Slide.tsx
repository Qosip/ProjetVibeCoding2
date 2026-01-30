'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SlideProps {
  children: ReactNode;
  index: number;
  currentSlide: number;
}

export default function Slide({ children, index, currentSlide }: SlideProps) {
  const isActive = index === currentSlide;
  const direction = index > currentSlide ? 1 : -1;

  return (
    <motion.div
      initial={{ opacity: 0, x: direction * 100, scale: 0.95 }}
      animate={{
        opacity: isActive ? 1 : 0,
        x: isActive ? 0 : direction * 50,
        scale: isActive ? 1 : 0.95,
      }}
      exit={{ opacity: 0, x: -direction * 100, scale: 0.95 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1],
        opacity: { duration: 0.4 }
      }}
      className={`absolute inset-0 flex items-center justify-center ${
        isActive ? 'pointer-events-auto z-10' : 'pointer-events-none z-0'
      }`}
    >
      {children}
    </motion.div>
  );
}
