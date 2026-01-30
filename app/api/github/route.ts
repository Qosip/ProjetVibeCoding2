import { NextRequest, NextResponse } from 'next/server';

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
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

    // Fetch commits depuis GitHub API (publique, pas besoin d'auth pour repos publics)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Code-Roast-Wrapped',
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
      return NextResponse.json(
        { error: 'Aucun commit trouvé' },
        { status: 404 }
      );
    }

    // Convertir au format git log avec heure pour meilleure analyse
    const gitLogLines = commits.map((commit) => {
      const date = new Date(commit.commit.author.date);
      const dateStr = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const message = commit.commit.message.split('\n')[0]; // Première ligne seulement
      const hash = commit.sha.substring(0, 7);
      
      // Format: hash date hour message (pour parser amélioré)
      return `${hash} ${dateStr} ${hour} ${message}`;
    });

    return NextResponse.json({
      gitLog: gitLogLines.join('\n'),
      repo: `${owner}/${repo}`,
      totalCommits: commits.length,
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commits' },
      { status: 500 }
    );
  }
}
