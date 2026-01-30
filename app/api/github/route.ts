import { NextRequest, NextResponse } from 'next/server';

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'URL du repo requise' },
        { status: 400 }
      );
    }

    // Extraire owner et repo de l'URL
    // Support: https://github.com/owner/repo ou owner/repo
    let owner = '';
    let repo = '';

    if (repoUrl.includes('github.com')) {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        return NextResponse.json(
          { error: 'URL GitHub invalide' },
          { status: 400 }
        );
      }
      owner = match[1];
      repo = match[2].replace(/\.git$/, '').replace(/\/$/, '');
    } else {
      const parts = repoUrl.split('/');
      if (parts.length !== 2) {
        return NextResponse.json(
          { error: 'Format invalide. Utilise: owner/repo ou https://github.com/owner/repo' },
          { status: 400 }
        );
      }
      owner = parts[0];
      repo = parts[1];
    }

    // Fetch ALL commits depuis GitHub API (publique)
    // On va paginer pour avoir tous les commits
    const allCommits: GitHubCommit[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) { // Limite à 10 pages (1000 commits) pour éviter timeout
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Project-Analytics',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { error: 'Repo introuvable ou privé' },
            { status: 404 }
          );
        }
        if (response.status === 403) {
          return NextResponse.json(
            { error: 'Rate limit GitHub atteint. Réessaie plus tard.' },
            { status: 403 }
          );
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const commits: GitHubCommit[] = await response.json();

      if (commits.length === 0) {
        hasMore = false;
      } else {
        allCommits.push(...commits);
        page++;
      }
    }

    if (allCommits.length === 0) {
      return NextResponse.json(
        { error: 'Aucun commit trouvé' },
        { status: 404 }
      );
    }

    // Convertir au format avancé: hash|author|email|date|message
    const gitLogLines = allCommits.map((commit) => {
      const hash = commit.sha.substring(0, 7);
      const author = commit.commit.author.name;
      const email = commit.commit.author.email;
      const date = commit.commit.author.date; // Format ISO
      const message = commit.commit.message.split('\n')[0].replace(/\|/g, ' '); // Première ligne, remove pipes

      return `${hash}|${author}|${email}|${date}|${message}`;
    });

    return NextResponse.json({
      gitLog: gitLogLines.join('\n'),
      repo: `${owner}/${repo}`,
      totalCommits: allCommits.length,
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commits' },
      { status: 500 }
    );
  }
}

