const OWNER  = 'manurathansetty';
const REPO   = 'sanskaar-montessori';
const BRANCH = 'master';
const BASE   = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

export class GitHubAuthError extends Error {}

function token(): string {
  const t = process.env.GITHUB_TOKEN;
  if (!t) throw new GitHubAuthError('GITHUB_TOKEN env var not set');
  return t;
}

function headers() {
  return {
    Authorization: `Bearer ${token()}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${BASE}/${path}?ref=${BRANCH}`, { headers: headers() });
  if (res.status === 401 || res.status === 403) throw new GitHubAuthError('GitHub auth failed');
  if (!res.ok) throw new Error(`GitHub GET ${path} → ${res.status}`);
  const data = (await res.json()) as { content: string; sha: string };
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { content, sha: data.sha };
}

export async function putFile(
  path: string,
  contentString: string,
  sha: string,
  message: string
): Promise<void> {
  const encoded = Buffer.from(contentString, 'utf8').toString('base64');
  const body = JSON.stringify({
    message,
    content: encoded,
    sha,
    branch: BRANCH,
    committer: { name: 'Sanskaar Admin', email: 'admin@sanskaarmontessori.local' },
  });
  const res = await fetch(`${BASE}/${path}`, { method: 'PUT', headers: headers(), body });
  if (res.status === 401 || res.status === 403) throw new GitHubAuthError('GitHub auth failed');
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub PUT ${path} → ${res.status}: ${txt}`);
  }
}
