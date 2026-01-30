export interface Commit {
  hash: string;
  date: string;
  message: string;
}

export interface GitStats {
  totalCommits: number;
  commits: Commit[];
  commitFrequency: { [key: string]: number };
  topWords: { word: string; count: number }[];
  longestStreak: number;
  busiestDay: string;
  busiestDayCount: number;
  averageCommitsPerDay: number;
  firstCommit: string;
  lastCommit: string;
  timeOfDayDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export function parseGitLog(gitLogText: string): GitStats {
  const lines = gitLogText.trim().split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('Git log vide');
  }

  const commits: Commit[] = [];
  const dateCounts: { [key: string]: number } = {};
  const wordCounts: { [key: string]: number } = {};
  const hourCounts: { [key: number]: number } = {};

  for (const line of lines) {
    // Format: hash date [hour] message
    // Supporte: "hash date message" ou "hash date hour message"
    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;

    const hash = parts[0];
    const date = parts[1];
    
    // Vérifier si le 3ème élément est un nombre (heure) ou fait partie du message
    let hour: number;
    let message: string;
    
    if (parts.length >= 4 && !isNaN(parseInt(parts[2]))) {
      // Format avec heure: hash date hour message
      hour = parseInt(parts[2]);
      message = parts.slice(3).join(' ');
    } else {
      // Format sans heure: hash date message (simuler l'heure)
      hour = parseInt(hash.substring(0, 2), 16) % 24;
      message = parts.slice(2).join(' ');
    }

    commits.push({ hash, date, message });

    // Compter les dates
    dateCounts[date] = (dateCounts[date] || 0) + 1;

    // Extraire les mots des messages
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Compter les heures
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }

  // Calculer le jour le plus actif
  let busiestDay = '';
  let busiestDayCount = 0;
  for (const [date, count] of Object.entries(dateCounts)) {
    if (count > busiestDayCount) {
      busiestDayCount = count;
      busiestDay = date;
    }
  }

  // Top mots
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // Calculer la plus longue série
  const sortedDates = Object.keys(dateCounts).sort();
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // Distribution des heures de la journée
  const morning = Object.entries(hourCounts)
    .filter(([h]) => parseInt(h) >= 6 && parseInt(h) < 12)
    .reduce((sum, [, count]) => sum + count, 0);
  
  const afternoon = Object.entries(hourCounts)
    .filter(([h]) => parseInt(h) >= 12 && parseInt(h) < 18)
    .reduce((sum, [, count]) => sum + count, 0);
  
  const evening = Object.entries(hourCounts)
    .filter(([h]) => parseInt(h) >= 18 && parseInt(h) < 22)
    .reduce((sum, [, count]) => sum + count, 0);
  
  const night = Object.entries(hourCounts)
    .filter(([h]) => parseInt(h) >= 22 || parseInt(h) < 6)
    .reduce((sum, [, count]) => sum + count, 0);

  const totalDays = Object.keys(dateCounts).length;
  const averageCommitsPerDay = totalDays > 0 ? commits.length / totalDays : 0;

  return {
    totalCommits: commits.length,
    commits,
    commitFrequency: dateCounts,
    topWords,
    longestStreak,
    busiestDay,
    busiestDayCount,
    averageCommitsPerDay: Math.round(averageCommitsPerDay * 10) / 10,
    firstCommit: sortedDates[0] || '',
    lastCommit: sortedDates[sortedDates.length - 1] || '',
    timeOfDayDistribution: {
      morning,
      afternoon,
      evening,
      night,
    },
  };
}
