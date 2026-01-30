'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { parseGitLog } from '@/lib/parser';
import { generateRoast, RoastResult } from '@/lib/roastEngine';
import Slide from '@/components/Slide';
import RoastCard from '@/components/RoastCard';
import Timeline from '@/components/Timeline';
import { exportAsPNG } from '@/lib/export';

export default function WrappedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [roastResult, setRoastResult] = useState<RoastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [repoName, setRepoName] = useState<string | null>(null);

  useEffect(() => {
    const gitLog = searchParams.get('log');
    const repo = searchParams.get('repo');
    
    if (repo) {
      setRepoName(repo);
    }
    
    if (!gitLog) {
      router.push('/');
      return;
    }

    try {
      const decoded = decodeURIComponent(gitLog);
      const stats = parseGitLog(decoded);
      const roast = generateRoast(stats);
      setRoastResult(roast);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du parsing');
      setLoading(false);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!roastResult) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [roastResult]);

  const handleNext = () => {
    if (roastResult && currentSlide < 5) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleExport = async () => {
    if (roastResult) {
      try {
        await exportAsPNG('roast-card', 'code-roast-wrapped.png');
      } catch (err) {
        console.error('Erreur export:', err);
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Analyse de ton code...</p>
        </motion.div>
      </main>
    );
  }

  if (error || !roastResult) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Erreur</h2>
          <p className="text-gray-300 mb-6">{error || 'Impossible de générer le roast'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Retour
          </button>
        </div>
      </main>
    );
  }

  const { stats } = roastResult;
  const totalSlides = 6;

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-900/50 z-50 backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
          style={{
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      {/* Slides container */}
      <div className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Slide 1: Intro */}
          <Slide key="intro" index={0} currentSlide={currentSlide}>
            <div className="text-center px-4">
              <motion.h1
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-7xl md:text-9xl font-bold mb-6 gradient-text"
              >
                2024
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-5xl text-gray-300 mb-4"
              >
                Ton année en code
              </motion.p>
              {repoName && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl md:text-2xl text-gray-500 font-mono"
                >
                  {repoName}
                </motion.p>
              )}
            </div>
          </Slide>

          {/* Slide 2: Commit count */}
          <Slide key="commits" index={1} currentSlide={currentSlide}>
            <div className="text-center px-4">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl md:text-4xl text-gray-400 mb-8"
              >
                Tu as fait
              </motion.p>
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="text-8xl md:text-9xl font-bold mb-8 gradient-text"
              >
                {stats.totalCommits}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl md:text-4xl text-gray-300"
              >
                commits cette année
              </motion.p>
            </div>
          </Slide>

          {/* Slide 3: Busiest day */}
          <Slide key="busiest" index={2} currentSlide={currentSlide}>
            <div className="text-center px-4">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl md:text-4xl text-gray-400 mb-8"
              >
                Ton jour le plus actif
              </motion.p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-3xl p-8 md:p-12 max-w-2xl mx-auto"
              >
                <div className="text-5xl md:text-7xl font-bold mb-4 gradient-text">
                  {stats.busiestDay}
                </div>
                <div className="text-3xl md:text-5xl text-gray-300">
                  {stats.busiestDayCount} commits
                </div>
              </motion.div>
            </div>
          </Slide>

          {/* Slide 4: Top words */}
          <Slide key="words" index={3} currentSlide={currentSlide}>
            <div className="text-center px-4 max-w-4xl mx-auto">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl md:text-4xl text-gray-400 mb-8"
              >
                Tes mots préférés
              </motion.p>
              <div className="glass rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {stats.topWords.slice(0, 5).map((word, index) => (
                    <motion.div
                      key={word.word}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1, type: 'spring' }}
                      className="text-center"
                    >
                      <div className="text-4xl md:text-6xl font-bold gradient-text mb-2">
                        {word.word}
                      </div>
                      <div className="text-lg text-gray-400">{word.count}x</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Slide>

          {/* Slide 5: Timeline */}
          <Slide key="timeline" index={4} currentSlide={currentSlide}>
            <div className="px-4 w-full h-full flex items-center justify-center overflow-y-auto py-20">
              <Timeline stats={stats} autoPlay={currentSlide === 4} />
            </div>
          </Slide>

          {/* Slide 6: Final roast */}
          <Slide key="roast" index={5} currentSlide={currentSlide}>
            <div className="px-4 w-full" id="roast-card">
              <RoastCard roast={roastResult} />
            </div>
          </Slide>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex items-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="glass px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition backdrop-blur-xl border border-white/10"
        >
          ← Précédent
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? 'bg-gradient-to-r from-purple-500 to-pink-500 w-8' : 'bg-gray-600 w-2'
              }`}
            />
          ))}
        </div>

        {currentSlide < totalSlides - 1 ? (
          <button
            onClick={handleNext}
            className="glass px-6 py-3 rounded-xl hover:bg-white/10 transition backdrop-blur-xl border border-white/10"
          >
            Suivant →
          </button>
        ) : (
          <button
            onClick={handleExport}
            className="glass px-6 py-3 rounded-xl hover:bg-white/10 transition bg-gradient-to-r from-purple-600/50 to-pink-600/50 backdrop-blur-xl border border-white/10"
          >
            📥 Exporter
          </button>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 glass px-4 py-2 rounded-xl hover:bg-white/10 transition z-50 backdrop-blur-xl border border-white/10"
      >
        ← Retour
      </button>
    </main>
  );
}
