'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedCommit } from '@/lib/advancedParser';
import { useState, useEffect } from 'react';

interface AnimatedTimelineProps {
    commits: AdvancedCommit[];
    autoPlay?: boolean;
}

export default function AnimatedTimeline({ commits, autoPlay = false }: AnimatedTimelineProps) {
    const [visibleCommits, setVisibleCommits] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Limiter à 50 commits pour la performance
    const displayCommits = commits.slice(-50).reverse();

    useEffect(() => {
        if (autoPlay) {
            setVisibleCommits(0);
            const interval = setInterval(() => {
                setVisibleCommits(prev => {
                    if (prev >= displayCommits.length) {
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 50);
            return () => clearInterval(interval);
        } else {
            setVisibleCommits(displayCommits.length);
        }
    }, [autoPlay, displayCommits.length]);

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const getCommitColor = (index: number) => {
        const colors = [
            'from-purple-500 to-pink-500',
            'from-pink-500 to-purple-500',
            'from-blue-500 to-purple-500',
            'from-purple-500 to-blue-500',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h3 className="text-4xl font-bold gradient-text mb-2">Timeline Vivante</h3>
                <p className="text-gray-400">Les {displayCommits.length} derniers commits</p>
            </motion.div>

            <div className="relative">
                {/* Central line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent transform -translate-x-1/2" />

                <div className="space-y-6">
                    <AnimatePresence>
                        {displayCommits.map((commit, index) => {
                            const isVisible = index < visibleCommits;
                            const isLeft = index % 2 === 0;

                            return (
                                <motion.div
                                    key={commit.hash}
                                    initial={{ opacity: 0, x: isLeft ? -100 : 100, scale: 0.8 }}
                                    animate={{
                                        opacity: isVisible ? 1 : 0,
                                        x: isVisible ? 0 : (isLeft ? -100 : 100),
                                        scale: isVisible ? 1 : 0.8,
                                    }}
                                    transition={{
                                        delay: index * 0.05,
                                        duration: 0.5,
                                        ease: 'easeOut',
                                    }}
                                    className={`flex items-center ${isLeft ? 'justify-start' : 'justify-end'} relative`}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {/* Commit node */}
                                    <motion.div
                                        className={`absolute left-1/2 transform -translate-x-1/2 z-10`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: isVisible ? 1 : 0 }}
                                        transition={{ delay: index * 0.05 + 0.2, type: 'spring', stiffness: 200 }}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getCommitColor(index)} shadow-lg ${hoveredIndex === index ? 'ring-4 ring-purple-500/50' : ''}`}>
                                            <motion.div
                                                className="w-full h-full rounded-full bg-gradient-to-br from-white/50 to-transparent"
                                                animate={hoveredIndex === index ? { scale: [1, 1.5, 1] } : {}}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Commit card */}
                                    <motion.div
                                        className={`w-[45%] ${isLeft ? 'mr-auto pr-8' : 'ml-auto pl-8'}`}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="glass rounded-xl p-4 border border-white/10 backdrop-blur-md hover:border-purple-500/30 transition-all">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-mono text-gray-400 mb-1">
                                                        {commit.hash.substring(0, 7)}
                                                    </p>
                                                    <p className="text-white font-medium line-clamp-2 text-sm">
                                                        {commit.message}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                                                    {commit.author}
                                                </span>
                                                <span>•</span>
                                                <span>{formatDate(commit.date)}</span>
                                                <span>{formatTime(commit.date)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {commits.length > 50 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="text-center text-gray-500 text-sm mt-8"
                >
                    + {commits.length - 50} commits plus anciens
                </motion.p>
            )}
        </div>
    );
}
