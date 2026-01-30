export interface AdvancedCommit {
  hash: string;
  author: string;
  email: string;
  date: Date;
  message: string;
  filesChanged?: number;
  insertions?: number;
  deletions?: number;
}

export interface CodeMetrics {
  totalLines: number;
  totalFiles: number;
  languageDistribution: { [key: string]: number };
  largestFile: { name: string; lines: number };
}

export interface AdvancedGitStats {
  // Basics
  totalCommits: number;
  commits: AdvancedCommit[];
  
  // Authors
  authors: { name: string; email: string; count: number }[];
  topAuthor: { name: string; count: number };
  
  // Time analysis
  firstCommit: Date;
  lastCommit: Date;
  projectAgeInDays: number;
  commitFrequency: { [key: string]: number };
  
  // Activity patterns
  busiestDay: string;
  busiestDayCount: number;
  longestStreak: number;
  averageCommitsPerDay: number;
  
  // Commit messages
  topWords: { word: string; count: number }[];
  averageMessageLength: number;
  shortMessageCount: number;
  
  // Code change metrics
  totalInsertions: number;
  totalDeletions: number;
  totalFilesChanged: number;
  averageFilesPerCommit: number;
  
  // Time distribution
  timeOfDayDistribution: {
    morning: number;   // 6-12
    afternoon: number; // 12-18
    evening: number;   // 18-22
    night: number;     // 22-6
  };
  
  // Day of week distribution
  dayOfWeekDistribution: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  
  // Commit patterns
  commitPatterns: {
    fixes: number;
    features: number;
    refactors: number;
    tests: number;
    docs: number;
    wip: number;
    merges: number;
  };
  
  // Monthly breakdown
  monthlyActivity: { month: string; count: number }[];
  
  // Productivity metrics
  productivityScore: number;
  consistencyScore: number;
  qualityScore: number;
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that',
  'have', 'has', 'was', 'were', 'been', 'are', 'will',
  'can', 'could', 'would', 'should', 'may', 'might',
  'des', 'les', 'une', 'dans', 'pour', 'sur', 'avec'
]);

export function parseAdvancedGitLog(gitLogText: string): AdvancedGitStats {
  const lines = gitLogText.trim().split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('Git log vide');
  }

  const commits: AdvancedCommit[] = [];
  const authorCounts: { [key: string]: { name: string; email: string; count: number } } = {};
  const dateCounts: { [key: string]: number } = {};
  const wordCounts: { [key: string]: number } = {};
  const hourCounts: { [key: number]: number } = {};
  const dayOfWeekCounts: number[] = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const monthlyActivityMap: { [key: string]: number } = {};
  
  let totalInsertions = 0;
  let totalDeletions = 0;
  let totalFilesChanged = 0;
  let totalMessageLength = 0;
  let shortMessageCount = 0;
  
  const commitPatterns = {
    fixes: 0,
    features: 0,
    refactors: 0,
    tests: 0,
    docs: 0,
    wip: 0,
    merges: 0,
  };

  // Parse commits
  for (const line of lines) {
    // Format supporté: "hash|author|email|date|message"
    const parts = line.split('|');
    if (parts.length < 5) {
      // Fallback: format simple "hash date message"
      const simpleParts = line.split(/\s+/);
      if (simpleParts.length < 3) continue;
      
      const hash = simpleParts[0];
      const dateStr = simpleParts[1];
      const message = simpleParts.slice(2).join(' ');
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue;
      
      commits.push({
        hash,
        author: 'Unknown',
        email: '',
        date,
        message,
      });
      
      processCommit('Unknown', '', date, message);
    } else {
      // Format avancé avec toutes les infos
      const [hash, author, email, dateStr, ...messageParts] = parts;
      const message = messageParts.join('|');
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue;
      
      commits.push({
        hash,
        author,
        email,
        date,
        message,
      });
      
      processCommit(author, email, date, message);
    }
  }

  function processCommit(author: string, email: string, date: Date, message: string) {
    // Author tracking
    const authorKey = `${author}|${email}`;
    if (!authorCounts[authorKey]) {
      authorCounts[authorKey] = { name: author, email, count: 0 };
    }
    authorCounts[authorKey].count++;

    // Date tracking
    const dateStr = date.toISOString().split('T')[0];
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;

    // Hour tracking
    const hour = date.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;

    // Day of week tracking
    const dayOfWeek = date.getDay();
    dayOfWeekCounts[dayOfWeek]++;

    // Monthly tracking
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyActivityMap[monthKey] = (monthlyActivityMap[monthKey] || 0) + 1;

    // Message analysis
    totalMessageLength += message.length;
    if (message.length < 10) shortMessageCount++;

    // Word extraction
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Pattern detection
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('fix') || lowerMsg.includes('bug')) commitPatterns.fixes++;
    if (lowerMsg.includes('feat') || lowerMsg.includes('feature') || lowerMsg.includes('add')) commitPatterns.features++;
    if (lowerMsg.includes('refactor')) commitPatterns.refactors++;
    if (lowerMsg.includes('test')) commitPatterns.tests++;
    if (lowerMsg.includes('doc') || lowerMsg.includes('readme')) commitPatterns.docs++;
    if (lowerMsg.includes('wip') || lowerMsg.includes('work in progress')) commitPatterns.wip++;
    if (lowerMsg.includes('merge')) commitPatterns.merges++;
  }

  // Calculate stats
  const authors = Object.values(authorCounts).sort((a, b) => b.count - a.count);
  const topAuthor = authors[0] || { name: 'Unknown', count: 0 };

  const sortedDates = Object.keys(dateCounts).sort();
  const firstCommit = commits.length > 0 ? new Date(Math.min(...commits.map(c => c.date.getTime()))) : new Date();
  const lastCommit = commits.length > 0 ? new Date(Math.max(...commits.map(c => c.date.getTime()))) : new Date();
  const projectAgeInDays = Math.floor((lastCommit.getTime() - firstCommit.getTime()) / (1000 * 60 * 60 * 24));

  // Busiest day
  let busiestDay = '';
  let busiestDayCount = 0;
  for (const [date, count] of Object.entries(dateCounts)) {
    if (count > busiestDayCount) {
      busiestDayCount = count;
      busiestDay = date;
    }
  }

  // Longest streak
  let longestStreak = 0;
  let currentStreak = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // Top words
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // Time distribution
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

  // Monthly activity
  const monthlyActivity = Object.entries(monthlyActivityMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));

  // Scores
  const averageCommitsPerDay = projectAgeInDays > 0 ? commits.length / projectAgeInDays : 0;
  const productivityScore = Math.min(100, Math.round((commits.length / Math.max(projectAgeInDays, 1)) * 10));
  const consistencyScore = Math.min(100, Math.round((longestStreak / Math.max(projectAgeInDays / 7, 1)) * 100));
  const qualityScore = Math.min(100, Math.round(((commits.length - shortMessageCount) / Math.max(commits.length, 1)) * 100));

  return {
    totalCommits: commits.length,
    commits,
    authors,
    topAuthor,
    firstCommit,
    lastCommit,
    projectAgeInDays,
    commitFrequency: dateCounts,
    busiestDay,
    busiestDayCount,
    longestStreak,
    averageCommitsPerDay: Math.round(averageCommitsPerDay * 10) / 10,
    topWords,
    averageMessageLength: commits.length > 0 ? Math.round(totalMessageLength / commits.length) : 0,
    shortMessageCount,
    totalInsertions,
    totalDeletions,
    totalFilesChanged,
    averageFilesPerCommit: commits.length > 0 ? Math.round(totalFilesChanged / commits.length * 10) / 10 : 0,
    timeOfDayDistribution: { morning, afternoon, evening, night },
    dayOfWeekDistribution: {
      sunday: dayOfWeekCounts[0],
      monday: dayOfWeekCounts[1],
      tuesday: dayOfWeekCounts[2],
      wednesday: dayOfWeekCounts[3],
      thursday: dayOfWeekCounts[4],
      friday: dayOfWeekCounts[5],
      saturday: dayOfWeekCounts[6],
    },
    commitPatterns,
    monthlyActivity,
    productivityScore,
    consistencyScore,
    qualityScore,
  };
}
