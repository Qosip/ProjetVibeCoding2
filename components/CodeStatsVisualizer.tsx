'use client';

import { motion } from 'framer-motion';
import { AdvancedGitStats } from '@/lib/advancedParser';

interface CodeStatsVisualizerProps {
    stats: AdvancedGitStats;
}

export default function CodeStatsVisualizer({ stats }: CodeStatsVisualizerProps) {
    const maxDayValue = Math.max(
        stats.dayOfWeekDistribution.monday,
        stats.dayOfWeekDistribution.tuesday,
        stats.dayOfWeekDistribution.wednesday,
        stats.dayOfWeekDistribution.thursday,
        stats.dayOfWeekDistribution.friday,
        stats.dayOfWeekDistribution.saturday,
        stats.dayOfWeekDistribution.sunday
    );

    const dayData = [
        { name: 'Lun', value: stats.dayOfWeekDistribution.monday },
        { name: 'Mar', value: stats.dayOfWeekDistribution.tuesday },
        { name: 'Mer', value: stats.dayOfWeekDistribution.wednesday },
        { name: 'Jeu', value: stats.dayOfWeekDistribution.thursday },
        { name: 'Ven', value: stats.dayOfWeekDistribution.friday },
        { name: 'Sam', value: stats.dayOfWeekDistribution.saturday },
        { name: 'Dim', value: stats.dayOfWeekDistribution.sunday },
    ];

    const timeData = [
        { name: 'Matin', value: stats.timeOfDayDistribution.morning, icon: '🌅', color: 'from-yellow-500 to-orange-500' },
        { name: 'Après-midi', value: stats.timeOfDayDistribution.afternoon, icon: '☀️', color: 'from-orange-500 to-red-500' },
        { name: 'Soirée', value: stats.timeOfDayDistribution.evening, icon: '🌆', color: 'from-purple-500 to-pink-500' },
        { name: 'Nuit', value: stats.timeOfDayDistribution.night, icon: '🌙', color: 'from-blue-500 to-purple-500' },
    ];

    const maxTimeValue = Math.max(...timeData.map(d => d.value));

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Day of Week Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/10"
                >
                    <h4 className="text-2xl font-bold mb-6 gradient-text">Activité par Jour</h4>
                    <div className="space-y-4">
                        {dayData.map((day, index) => {
                            const percentage = maxDayValue > 0 ? (day.value / maxDayValue) * 100 : 0;
                            return (
                                <div key={day.name}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-300">{day.name}</span>
                                        <span className="text-sm text-gray-400">{day.value} commits</span>
                                    </div>
                                    <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
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
                                                style={{ backgroundSize: '50% 100%' }}
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Time of Day Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/10"
                >
                    <h4 className="text-2xl font-bold mb-6 gradient-text">Heure de la Journée</h4>
                    <div className="space-y-4">
                        {timeData.map((time, index) => {
                            const percentage = maxTimeValue > 0 ? (time.value / maxTimeValue) * 100 : 0;
                            return (
                                <div key={time.name}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <span className="text-lg">{time.icon}</span>
                                            {time.name}
                                        </span>
                                        <span className="text-sm text-gray-400">{time.value} commits</span>
                                    </div>
                                    <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: index * 0.1 + 0.4, duration: 0.8, ease: 'easeOut' }}
                                            className={`h-full bg-gradient-to-r ${time.color} rounded-full relative`}
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
                                                style={{ backgroundSize: '50% 100%' }}
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Commit Patterns */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/10 md:col-span-2"
                >
                    <h4 className="text-2xl font-bold mb-6 gradient-text">Types de Commits</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: '🐛 Fixes', value: stats.commitPatterns.fixes, color: 'from-red-500 to-orange-500' },
                            { name: '✨ Features', value: stats.commitPatterns.features, color: 'from-green-500 to-emerald-500' },
                            { name: '♻️ Refactors', value: stats.commitPatterns.refactors, color: 'from-blue-500 to-cyan-500' },
                            { name: '🧪 Tests', value: stats.commitPatterns.tests, color: 'from-purple-500 to-pink-500' },
                            { name: '📝 Docs', value: stats.commitPatterns.docs, color: 'from-yellow-500 to-amber-500' },
                            { name: '🚧 WIP', value: stats.commitPatterns.wip, color: 'from-gray-500 to-gray-600' },
                            { name: '🔀 Merges', value: stats.commitPatterns.merges, color: 'from-indigo-500 to-purple-500' },
                        ].map((pattern, index) => (
                            <motion.div
                                key={pattern.name}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: index * 0.1 + 0.5, type: 'spring', stiffness: 200 }}
                                className="text-center p-4 rounded-xl bg-gray-900/30 border border-white/5 hover:border-white/20 transition-all"
                            >
                                <div className={`text-4xl font-bold bg-gradient-to-br ${pattern.color} bg-clip-text text-transparent mb-2`}>
                                    {pattern.value}
                                </div>
                                <div className="text-sm text-gray-400">{pattern.name}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
