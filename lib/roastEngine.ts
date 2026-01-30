import { GitStats } from './parser';

export interface RoastResult {
  roast: string;
  severity: 'soft' | 'medium' | 'hard';
  stats: GitStats;
}

export function generateRoast(stats: GitStats): RoastResult {
  const roasts: string[] = [];
  let severity: 'soft' | 'medium' | 'hard' = 'soft';
  let severityScore = 0;

  // Roast 1: Commit count
  if (stats.totalCommits > 1000) {
    roasts.push(`Tu as ${stats.totalCommits} commits. Tu codes ou tu spam ?`);
    severityScore += 2;
  } else if (stats.totalCommits > 500) {
    roasts.push(`${stats.totalCommits} commits. T'es un vrai bourreau de travail.`);
    severityScore += 1;
  } else if (stats.totalCommits < 10) {
    roasts.push(`Seulement ${stats.totalCommits} commits ? Tu codes vraiment ?`);
    severityScore += 2;
  }

  // Roast 2: Commit frequency
  if (stats.averageCommitsPerDay > 20) {
    roasts.push(`Tu commits ${stats.averageCommitsPerDay} fois par jour en moyenne. Touch grass.`);
    severityScore += 3;
  } else if (stats.averageCommitsPerDay > 10) {
    roasts.push(`${stats.averageCommitsPerDay} commits par jour ? Tu fais des micro-commits ou quoi ?`);
    severityScore += 2;
  }

  // Roast 3: Busiest day
  if (stats.busiestDayCount > 50) {
    roasts.push(`Le ${stats.busiestDay}, tu as fait ${stats.busiestDayCount} commits. T'as dû casser la prod.`);
    severityScore += 2;
  }

  // Roast 4: Top words analysis
  const topWord = stats.topWords[0];
  if (topWord) {
    if (topWord.word === 'fix' || topWord.word === 'bug') {
      roasts.push(`Ton mot préféré : "${topWord.word}" (${topWord.count}x). Ça sent le code cassé.`);
      severityScore += 3;
    } else if (topWord.word === 'update' || topWord.word === 'change') {
      roasts.push(`"${topWord.word}" apparaît ${topWord.count} fois. Originalité niveau 0.`);
      severityScore += 1;
    } else if (topWord.count > stats.totalCommits * 0.3) {
      roasts.push(`Tu utilises "${topWord.word}" dans ${Math.round((topWord.count / stats.totalCommits) * 100)}% de tes commits. Répétitif much ?`);
      severityScore += 2;
    }
  }

  // Roast 5: Longest streak
  if (stats.longestStreak > 30) {
    roasts.push(`${stats.longestStreak} jours de suite à coder. T'as une vie ?`);
    severityScore += 2;
  } else if (stats.longestStreak > 14) {
    roasts.push(`Streak de ${stats.longestStreak} jours. Respect mais... dors un peu.`);
    severityScore += 1;
  }

  // Roast 6: Time distribution
  const { night, morning } = stats.timeOfDayDistribution;
  if (night > morning * 2) {
    roasts.push(`Tu codes plus la nuit que le matin. Ça explique les bugs.`);
    severityScore += 2;
  }

  // Roast 7: Commit message quality
  const shortMessages = stats.commits.filter(c => c.message.length < 10).length;
  if (shortMessages > stats.totalCommits * 0.5) {
    roasts.push(`${Math.round((shortMessages / stats.totalCommits) * 100)}% de tes commits font moins de 10 caractères. "fix" n'est pas un message.`);
    severityScore += 3;
  }

  // Roast 8: Variety check
  if (stats.topWords.length < 5 && stats.totalCommits > 50) {
    roasts.push(`Tu utilises seulement ${stats.topWords.length} mots différents. Vocabulaire de dev confirmé.`);
    severityScore += 1;
  }

  // Roast 9: Consistency
  const uniqueDates = Object.keys(stats.commitFrequency).length;
  const daysBetween = stats.firstCommit && stats.lastCommit 
    ? Math.floor((new Date(stats.lastCommit).getTime() - new Date(stats.firstCommit).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  if (daysBetween > 0 && uniqueDates / daysBetween < 0.3) {
    roasts.push(`Tu codes seulement ${Math.round((uniqueDates / daysBetween) * 100)}% du temps. Weekend warrior ?`);
    severityScore += 1;
  }

  // Roast 10: Final roast based on severity
  if (severityScore >= 8) {
    roasts.push(`Verdict final : Tu es un développeur chaotique mais dédié. Continue comme ça (ou pas).`);
    severity = 'hard';
  } else if (severityScore >= 4) {
    roasts.push(`Verdict final : Tu codes beaucoup mais avec style. Pas mal.`);
    severity = 'medium';
  } else {
    roasts.push(`Verdict final : Tu es un développeur équilibré. Boring mais efficace.`);
    severity = 'soft';
  }

  // Roast 11: Special cases
  if (stats.totalCommits === 1) {
    roasts.push(`Un seul commit ? T'es sûr que c'est un repo ?`);
    severityScore += 3;
  }

  // Roast 12: Commit message patterns
  const fixCount = stats.commits.filter(c => 
    c.message.toLowerCase().includes('fix') || 
    c.message.toLowerCase().includes('bug')
  ).length;
  
  if (fixCount > stats.totalCommits * 0.4) {
    roasts.push(`${Math.round((fixCount / stats.totalCommits) * 100)}% de tes commits sont des fixes. Tu testes avant de push ?`);
    severityScore += 2;
  }

  // Roast 13: WIP commits
  const wipCount = stats.commits.filter(c => 
    c.message.toLowerCase().includes('wip') || 
    c.message.toLowerCase().includes('work in progress')
  ).length;
  
  if (wipCount > 0) {
    roasts.push(`${wipCount} commits "WIP". Tu finis jamais rien ?`);
    severityScore += 1;
  }

  // Roast 14: Typo commits
  const typoCount = stats.commits.filter(c => 
    c.message.toLowerCase().includes('typo') || 
    c.message.toLowerCase().includes('fix typo')
  ).length;
  
  if (typoCount > 5) {
    roasts.push(`${typoCount} commits pour des fautes. Utilise un correcteur.`);
    severityScore += 1;
  }

  // Roast 15: Refactor commits
  const refactorCount = stats.commits.filter(c => 
    c.message.toLowerCase().includes('refactor')
  ).length;
  
  if (refactorCount > stats.totalCommits * 0.3) {
    roasts.push(`Tu refactores ${Math.round((refactorCount / stats.totalCommits) * 100)}% du temps. Tu codes bien du premier coup ou quoi ?`);
    severityScore += 1;
  }

  // Roast 16: Merge commits
  const mergeCount = stats.commits.filter(c => 
    c.message.toLowerCase().includes('merge')
  ).length;
  
  if (mergeCount > stats.totalCommits * 0.2) {
    roasts.push(`${mergeCount} merges. Tu travailles seul ou tu gères mal les branches ?`);
    severityScore += 1;
  }

  // Roast 17: Test commits
  const testCount = stats.commits.filter(c => 
    c.message.toLowerCase().includes('test')
  ).length;
  
  if (testCount < stats.totalCommits * 0.1 && stats.totalCommits > 50) {
    roasts.push(`Seulement ${testCount} commits de tests sur ${stats.totalCommits}. T'es sûr que ça marche ?`);
    severityScore += 2;
  }

  // Roast 18: Documentation
  const docCount = stats.commits.filter(c => 
    c.message.toLowerCase().includes('doc') || 
    c.message.toLowerCase().includes('readme')
  ).length;
  
  if (docCount === 0 && stats.totalCommits > 30) {
    roasts.push(`Zéro commit de doc. La doc c'est pour les faibles, c'est ça ?`);
    severityScore += 1;
  }

  // Roast 19: Feature vs fix ratio
  const featureCount = stats.commits.filter(c => 
    c.message.toLowerCase().includes('feat') || 
    c.message.toLowerCase().includes('feature') ||
    c.message.toLowerCase().includes('add')
  ).length;
  
  if (fixCount > featureCount * 2 && stats.totalCommits > 20) {
    roasts.push(`Tu fixes ${fixCount} bugs pour ${featureCount} features. Tu codes ou tu réparés ?`);
    severityScore += 2;
  }

  // Roast 20: Commit frequency consistency
  const dateValues = Object.values(stats.commitFrequency);
  const maxCommits = Math.max(...dateValues);
  const minCommits = Math.min(...dateValues);
  
  if (maxCommits > minCommits * 10 && stats.totalCommits > 50) {
    roasts.push(`Tu passes de ${minCommits} à ${maxCommits} commits par jour. Inconsistance level 100.`);
    severityScore += 1;
  }

  // Final severity adjustment
  if (severityScore >= 10) severity = 'hard';
  else if (severityScore >= 5) severity = 'medium';
  else severity = 'soft';

  const finalRoast = roasts.join(' ');

  return {
    roast: finalRoast,
    severity,
    stats,
  };
}
