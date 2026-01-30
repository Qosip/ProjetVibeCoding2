'use client';

import { motion } from 'framer-motion';
import { RoastResult } from '@/lib/roastEngine';

interface RoastCardProps {
  roast: RoastResult;
  repoName?: string | null;
}

export default function RoastCard({ roast, repoName }: RoastCardProps) {
  const severityColors = {
    soft: 'from-green-500 to-emerald-600',
    medium: 'from-yellow-500 to-orange-600',
    hard: 'from-red-500 to-pink-600',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass rounded-3xl p-8 md:p-12 max-w-4xl mx-auto"
    >
      <div className={`bg-gradient-to-br ${severityColors[roast.severity]} rounded-2xl p-8 text-center`}>
        {repoName && (
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 font-mono mb-4"
          >
            {repoName}
          </motion.p>
        )}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mb-6 text-white"
        >
          {roast.severity === 'hard' && '🔥'}
          {roast.severity === 'medium' && '⚡'}
          {roast.severity === 'soft' && '✨'}
          {' '}ROAST FINAL
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white leading-relaxed"
        >
          {roast.roast}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-8 border-t border-white/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/90">
            <div>
              <div className="text-3xl font-bold">{roast.stats.totalCommits}</div>
              <div className="text-sm opacity-80">Commits</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{roast.stats.longestStreak}</div>
              <div className="text-sm opacity-80">Jours streak</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{roast.stats.averageCommitsPerDay}</div>
              <div className="text-sm opacity-80">Par jour</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{roast.stats.topWords[0]?.word || 'N/A'}</div>
              <div className="text-sm opacity-80">Mot favori</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
