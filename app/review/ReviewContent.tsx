'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { parseAdvancedGitLog, type AdvancedGitStats } from '@/lib/advancedParser';
import { parseGitLog } from '@/lib/parser';
import type { GitStats } from '@/lib/parser';
import { generateRoast, type RoastResult } from '@/lib/roastEngine';
import Slide from '@/components/Slide';
import RoastCard from '@/components/RoastCard';
import Timeline from '@/components/Timeline';
import { exportAsPNG } from '@/lib/export';

function advancedToSimpleStats(adv: AdvancedGitStats): GitStats {
  return {
    totalCommits: adv.totalCommits,
    commits: adv.commits.map((c) => ({
      hash: c.hash,
      date: c.date.toISOString().split('T')[0],
      message: c.message,
    })),
    commitFrequency: adv.commitFrequency,
    topWords: adv.topWords,
    longestStreak: adv.longestStreak,
    busiestDay: adv.busiestDay,
    busiestDayCount: adv.busiestDayCount,
    averageCommitsPerDay: adv.averageCommitsPerDay,
    firstCommit: adv.firstCommit.toISOString().split('T')[0],
    lastCommit: adv.lastCommit.toISOString().split('T')[0],
    timeOfDayDistribution: adv.timeOfDayDistribution,
  };
}

function parseLogAndAdvanced(gitLogText: string): { stats: GitStats; advanced: AdvancedGitStats | null } {
  const trimmed = gitLogText.trim();
  if (!trimmed) throw new Error('Git log vide');
  const firstLine = trimmed.split('\n')[0] ?? '';
  if (firstLine.includes('|') && firstLine.split('|').length >= 5) {
    const advanced = parseAdvancedGitLog(trimmed);
    return { stats: advancedToSimpleStats(advanced), advanced };
  }
  return { stats: parseGitLog(trimmed), advanced: null };
}

export default function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [roastResult, setRoastResult] = useState<RoastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [repoName, setRepoName] = useState<string | null>(null);
  const [advancedStats, setAdvancedStats] = useState<AdvancedGitStats | null>(null);

  useEffect(() => {
    const gitLog = searchParams.get('log');
    const repo = searchParams.get('repo');

    if (repo) setRepoName(repo);

    if (!gitLog) {
      router.push('/');
      return;
    }

    try {
      const decoded = decodeURIComponent(gitLog);
      const { stats, advanced } = parseLogAndAdvanced(decoded);
      const roast = generateRoast(stats);
      setRoastResult(roast);
      setAdvancedStats(advanced);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du parsing');
      setLoading(false);
    }
  }, [searchParams, router]);

  const totalSlidesCount = 11;
  const handleNext = () => {
    if (roastResult && currentSlide < totalSlidesCount - 1) setCurrentSlide(currentSlide + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
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
  const startYear = stats.firstCommit ? stats.firstCommit.slice(0, 4) : '2024';
  const projectDays = stats.firstCommit && stats.lastCommit
    ? Math.max(0, Math.floor((new Date(stats.lastCommit).getTime() - new Date(stats.firstCommit).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const { morning, afternoon, evening, night } = stats.timeOfDayDistribution;
  const totalByTime = morning + afternoon + evening + night;
  const pct = (n: number) => (totalByTime > 0 ? Math.round((n / totalByTime) * 100) : 0);

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-900/50 z-50 backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / totalSlidesCount) * 100}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
        />
      </div>

      <div className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <Slide key="intro" index={0} currentSlide={currentSlide}>
            <div className="text-center px-4">
              <motion.h1
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-7xl md:text-9xl font-bold mb-6 gradient-text"
              >
                {startYear}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-5xl text-gray-300 mb-4"
              >
                Ton projet en code
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

          <Slide key="commits" index={1} currentSlide={currentSlide}>
            <div className="text-center px-4">
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-4xl text-gray-400 mb-8">
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
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-2xl md:text-4xl text-gray-300">
                commits sur ce projet
              </motion.p>
            </div>
          </Slide>

          <Slide key="busiest" index={2} currentSlide={currentSlide}>
            <div className="text-center px-4">
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-4xl text-gray-400 mb-8">
                Ton jour le plus actif
              </motion.p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-3xl p-8 md:p-12 max-w-2xl mx-auto"
              >
                <div className="text-5xl md:text-7xl font-bold mb-4 gradient-text">{stats.busiestDay}</div>
                <div className="text-3xl md:text-5xl text-gray-300">{stats.busiestDayCount} commits</div>
              </motion.div>
            </div>
          </Slide>

          <Slide key="avg-per-day" index={3} currentSlide={currentSlide}>
            <div className="text-center px-4">
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-4xl text-gray-400 mb-4">
                En moyenne par jour
              </motion.p>
              <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-gray-500 mb-6">
                sur toute la durée du projet
              </motion.p>
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="text-8xl md:text-9xl font-bold mb-8 gradient-text"
              >
                {stats.averageCommitsPerDay}
              </motion.h2>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-2xl md:text-4xl text-gray-300">
                commits par jour
              </motion.p>
            </div>
          </Slide>

          <Slide key="streak" index={4} currentSlide={currentSlide}>
            <div className="text-center px-4">
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-4xl text-gray-400 mb-8">
                Ta plus longue série
              </motion.p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-3xl p-8 md:p-12 max-w-2xl mx-auto"
              >
                <div className="text-6xl md:text-8xl font-bold mb-4 gradient-text">{stats.longestStreak}</div>
                <div className="text-2xl md:text-4xl text-gray-300">jours d&apos;affilée à coder</div>
              </motion.div>
            </div>
          </Slide>

          <Slide key="time-of-day" index={5} currentSlide={currentSlide}>
            <div className="text-center px-4 max-w-2xl mx-auto">
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-4xl text-gray-400 mb-8">
                Tu codes plutôt...
              </motion.p>
              <div className="glass rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-white/10 space-y-6">
                {[
                  { label: 'Matin (6h–12h)', value: morning, pct: pct(morning) },
                  { label: 'Après-midi (12h–18h)', value: afternoon, pct: pct(afternoon) },
                  { label: 'Soir (18h–22h)', value: evening, pct: pct(evening) },
                  { label: 'Nuit (22h–6h)', value: night, pct: pct(night) },
                ].map(({ label, value, pct: percent }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="flex justify-between text-sm md:text-base text-gray-400 mb-1">
                      <span>{label}</span>
                      <span>{value} commits ({percent}%)</span>
                    </div>
                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Slide>

          <Slide key="period" index={6} currentSlide={currentSlide}>
            <div className="text-center px-4">
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-4xl text-gray-400 mb-8">
                Tu codes depuis
              </motion.p>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-3xl p-8 md:p-12 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
              >
                <div className="text-center">
                  <div className="text-sm md:text-base text-gray-500 uppercase tracking-wider mb-2">Début</div>
                  <div className="text-2xl md:text-4xl font-bold gradient-text">{stats.firstCommit}</div>
                </div>
                <div className="text-gray-500 text-xl">→</div>
                <div className="text-center">
                  <div className="text-sm md:text-base text-gray-500 uppercase tracking-wider mb-2">Fin</div>
                  <div className="text-2xl md:text-4xl font-bold gradient-text">{stats.lastCommit}</div>
                </div>
              </motion.div>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-2xl md:text-3xl text-gray-300"
              >
                <span className="font-bold gradient-text">{projectDays}</span> jours de code
              </motion.p>
            </div>
          </Slide>

          <Slide key="contributors" index={7} currentSlide={currentSlide}>
            <div className="text-center px-4 max-w-3xl mx-auto">
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-4xl text-gray-400 mb-8">
                Meilleurs contributeurs
              </motion.p>
              {advancedStats?.authors && advancedStats.authors.length > 0 ? (
                <div className="glass rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-white/10">
                  <div className="space-y-4">
                    {advancedStats.authors.slice(0, 10).map((author, index) => {
                      const medals = ['🥇', '🥈', '🥉'] as const;
                      const pct = stats.totalCommits > 0 ? Math.round((author.count / stats.totalCommits) * 100) : 0;
                      return (
                        <motion.div
                          key={`${author.name}-${author.email}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition"
                        >
                          <span className="text-2xl md:text-3xl w-10 shrink-0">
                            {index < 3 ? medals[index] : <span className="text-gray-500 font-mono text-lg">#{index + 1}</span>}
                          </span>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-bold text-gray-100 text-lg md:text-xl truncate" title={author.name}>{author.name}</div>
                            {author.email && (
                              <div className="text-sm text-gray-500 truncate" title={author.email}>{author.email}</div>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xl md:text-2xl font-bold gradient-text">{author.count}</div>
                            <div className="text-xs text-gray-500">commits ({pct}%)</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-3xl p-8 md:p-12 text-gray-400"
                >
                  <p className="text-lg md:text-xl">
                    Importe via une URL GitHub pour voir les contributeurs du projet.
                  </p>
                </motion.div>
              )}
            </div>
          </Slide>

          <Slide key="words" index={8} currentSlide={currentSlide}>
            <div className="text-center px-4 max-w-4xl mx-auto">
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-4xl text-gray-400 mb-8">
                Tes mots préférés — Classement
              </motion.p>
              <div className="glass rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-white/10">
                {/* Podium : 2e au centre-gauche, 1er au centre (plus haut), 3e au centre-droite */}
                <div className="flex items-end justify-center gap-4 md:gap-8 mb-8 min-h-[200px]">
                  {[1, 0, 2].map((podiumIndex) => {
                    const word = stats.topWords[podiumIndex];
                    if (!word) return null;
                    const rank = podiumIndex === 0 ? 2 : podiumIndex === 1 ? 1 : 3;
                    const medals = ['🥈', '🥇', '🥉'] as const;
                    const heights = ['h-24', 'h-36', 'h-20'] as const;
                    return (
                      <motion.div
                        key={word.word}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: rank * 0.15, type: 'spring', stiffness: 200 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-4xl md:text-5xl mb-2">{medals[podiumIndex]}</span>
                        <div className={`glass rounded-t-2xl px-6 py-4 min-w-[140px] md:min-w-[180px] w-max ${heights[podiumIndex]} flex flex-col justify-end`}>
                          <div className="text-2xl md:text-4xl font-bold gradient-text whitespace-nowrap" title={word.word}>{word.word}</div>
                          <div className="text-sm text-gray-400">{word.count}x</div>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">#{rank}</div>
                      </motion.div>
                    );
                  })}
                </div>
                {/* Reste du classement */}
                {stats.topWords.length > 3 && (
                  <div className="border-t border-white/10 pt-6">
                    <p className="text-sm text-gray-500 mb-3">Suite du classement</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {stats.topWords.slice(3, 10).map((word, index) => (
                        <motion.div
                          key={word.word}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="glass rounded-xl px-4 py-2 flex items-center gap-2"
                        >
                          <span className="text-gray-500 font-mono">#{index + 4}</span>
                          <span className="font-bold text-gray-200">{word.word}</span>
                          <span className="text-gray-400 text-sm">{word.count}x</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Slide>

          <Slide key="timeline" index={9} currentSlide={currentSlide}>
            <div className="px-4 w-full h-full flex flex-col items-center py-16 pb-24">
              <div className="w-full max-w-2xl flex-1 min-h-0 overflow-y-auto rounded-2xl glass p-4 border border-white/10">
                <Timeline stats={stats} autoPlay={currentSlide === 9} />
              </div>
            </div>
          </Slide>

          <Slide key="roast" index={10} currentSlide={currentSlide}>
            <div className="px-4 w-full" id="roast-card">
              <RoastCard roast={roastResult} repoName={repoName ?? undefined} />
            </div>
          </Slide>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex items-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="glass px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition backdrop-blur-xl border border-white/10"
        >
          ← Précédent
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalSlidesCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${i === currentSlide ? 'bg-gradient-to-r from-purple-500 to-pink-500 w-8' : 'bg-gray-600 w-2'}`}
            />
          ))}
        </div>

        {currentSlide < totalSlidesCount - 1 ? (
          <button onClick={handleNext} className="glass px-6 py-3 rounded-xl hover:bg-white/10 transition backdrop-blur-xl border border-white/10">
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

      <button
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 glass px-4 py-2 rounded-xl hover:bg-white/10 transition z-50 backdrop-blur-xl border border-white/10"
      >
        ← Retour
      </button>
    </main>
  );
}
