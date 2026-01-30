'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type InputMode = 'github' | 'manual';

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>('github');
  const [githubUrl, setGithubUrl] = useState('');
  const [gitLog, setGitLog] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGithubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!githubUrl.trim()) {
      setError('Entre une URL GitHub');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: githubUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la récupération');
        setLoading(false);
        return;
      }

      // Rediriger avec le git log
      const encoded = encodeURIComponent(data.gitLog);
      router.push(`/review?log=${encoded}&repo=${encodeURIComponent(data.repo)}`);
    } catch (err) {
      setError('Erreur de connexion');
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gitLog.trim()) {
      setError('Colle ton git log pour commencer');
      return;
    }

    const lines = gitLog.trim().split('\n');
    if (lines.length < 1) {
      setError('Git log invalide');
      return;
    }

    const encoded = encodeURIComponent(gitLog.trim());
    router.push(`/review?log=${encoded}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-7xl md:text-9xl font-bold mb-4 gradient-text"
          >
            Project
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-5xl text-gray-300 mb-2 font-light"
          >
            Analytics
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 mt-6 text-lg"
          >
            Analyse complète et détaillée de l'historique de ton projet
          </motion.p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => {
              setInputMode('github');
              setError('');
            }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${inputMode === 'github'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'glass text-gray-400 hover:text-white'
              }`}
          >
            🔗 URL GitHub
          </button>
          <button
            onClick={() => {
              setInputMode('manual');
              setError('');
            }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${inputMode === 'manual'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'glass text-gray-400 hover:text-white'
              }`}
          >
            📝 Git Log
          </button>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={inputMode === 'github' ? handleGithubSubmit : handleManualSubmit}
          className="glass rounded-3xl p-8 md:p-10 backdrop-blur-xl border border-white/10"
        >
          {inputMode === 'github' ? (
            <div className="mb-6">
              <label htmlFor="githubUrl" className="block text-sm font-medium mb-3 text-gray-300">
                URL du repository GitHub
              </label>
              <input
                id="githubUrl"
                type="text"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://github.com/owner/repo ou owner/repo"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <p className="mt-3 text-xs text-gray-500">
                Fonctionne avec tous les repos publics GitHub
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="gitlog" className="block text-sm font-medium mb-3 text-gray-300">
                Git Log
              </label>
              <textarea
                id="gitlog"
                value={gitLog}
                onChange={(e) => {
                  setGitLog(e.target.value);
                  setError('');
                }}
                placeholder='Colle ici le résultat de: git log --all --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso'
                className="w-full h-48 bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
              />
              <p className="mt-3 text-xs text-gray-500">
                Format recommandé : <code className="bg-gray-800 px-2 py-1 rounded">hash|author|email|date|message</code>
              </p>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-5 px-6 rounded-xl text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Récupération des commits...
              </>
            ) : (
              <>
                Analyser le Projet 🚀
              </>
            )}
          </motion.button>
        </motion.form>

        {inputMode === 'manual' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-sm text-gray-500"
          >
            <button
              onClick={() => {
                const example = `a1b2c3d|John Doe|john@example.com|2024-01-15 10:30:00 +0100|Initial commit
e4f5g6h|Jane Smith|jane@example.com|2024-01-15 14:20:00 +0100|Add feature
i7j8k9l|John Doe|john@example.com|2024-01-16 09:15:00 +0100|Fix bug
m1n2o3p|Jane Smith|jane@example.com|2024-01-16 16:45:00 +0100|Update documentation
q4r5s6t|John Doe|john@example.com|2024-01-17 11:00:00 +0100|Refactor code`;
                setGitLog(example);
              }}
              className="text-purple-400 hover:text-purple-300 underline transition-colors"
            >
              Charger un exemple
            </button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
