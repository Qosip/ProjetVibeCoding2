'use client';

import { motion } from 'framer-motion';
import { GitStats } from '@/lib/parser';
import { useState, useEffect } from 'react';

interface TimelineProps {
  stats: GitStats;
  autoPlay?: boolean;
}

export default function Timeline({ stats, autoPlay = false }: TimelineProps) {
  const dates = Object.keys(stats.commitFrequency).sort();
  const maxCommits = Math.max(...Object.values(stats.commitFrequency));
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    if (autoPlay) {
      setVisibleItems(0);
      const interval = setInterval(() => {
        setVisibleItems((prev) => {
          if (prev >= Math.min(dates.length, 20)) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVisibleItems(Math.min(dates.length, 20));
    }
  }, [autoPlay, dates.length]);

  const displayedDates = dates.slice(0, 20);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold mb-8 text-center gradient-text"
      >
        Timeline des commits
      </motion.h3>
      <div className="space-y-3">
        {displayedDates.map((date, index) => {
          const count = stats.commitFrequency[date];
          const width = maxCommits > 0 ? (count / maxCommits) * 100 : 0;
          const isVisible = index < visibleItems;

          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, x: -50 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                x: isVisible ? 0 : -50,
              }}
              transition={{
                delay: index * 0.08,
                duration: 0.5,
                ease: 'easeOut',
              }}
              className="flex items-center gap-4 group"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ delay: index * 0.08 + 0.2 }}
                className="text-sm md:text-base text-gray-400 w-28 md:w-32 font-mono"
              >
                {date}
              </motion.span>
              <div className="flex-1 bg-gray-800/50 rounded-full h-8 md:h-10 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isVisible ? `${width}%` : 0 }}
                  transition={{
                    delay: index * 0.08 + 0.3,
                    duration: 0.8,
                    ease: 'easeOut',
                  }}
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full relative overflow-hidden"
                  style={{
                    backgroundSize: '200% 100%',
                  }}
                >
                  <motion.div
                    animate={{
                      backgroundPosition: ['0%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{
                      backgroundSize: '50% 100%',
                    }}
                  />
                </motion.div>
                {isVisible && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: index * 0.08 + 0.5,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className="absolute inset-0 flex items-center justify-end pr-3"
                  >
                    <span className="text-xs md:text-sm font-bold text-white drop-shadow-lg">
                      {count}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {dates.length > 20 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          ... et {dates.length - 20} autres jours
        </motion.p>
      )}
    </div>
  );
}
