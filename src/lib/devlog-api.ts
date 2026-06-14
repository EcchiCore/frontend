import { getSdk } from './sdk';

export interface RevisionAuthor {
  id: number;
  name: string;
}

export interface DiffStats {
  additions: number;
  deletions: number;
}

export interface Revision {
  version: number;
  author: RevisionAuthor;
  message?: string;
  notes?: string;
  createdAt: string;
  stats: DiffStats;
  summary: string;
}

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  lineNumber?: number;
}

export interface RevisionDetail extends Revision {
  titleDiff: string;
  descriptionDiff: string;
  bodyDiff: string;
  parsedBodyDiff: DiffLine[];
}

export interface RevisionsListResponse {
  revisions: Revision[];
  total: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.chanomhub.com';

// Clean the base URL by stripping trailing slash
const cleanApiUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token: string | undefined;
  if (typeof window !== 'undefined') {
    const getCookie = (name: string): string | null => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
      return null;
    };
    token = getCookie('token') ?? undefined;
  } else {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      token = cookieStore.get('token')?.value;
    } catch {
      // ignore
    }
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function getArticleRevisions(slug: string): Promise<RevisionsListResponse> {
  try {
    const res = await fetchWithAuth(`${cleanApiUrl}/api/articles/${slug}/revisions`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch revisions: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Error in getArticleRevisions for ${slug}:`, error);
    return { revisions: [], total: 0 };
  }
}

export async function getArticleRevisionDetail(slug: string, version: number): Promise<RevisionDetail | null> {
  try {
    const res = await fetchWithAuth(`${cleanApiUrl}/api/articles/${slug}/revisions/${version}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch revision detail: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Error in getArticleRevisionDetail for ${slug} v${version}:`, error);
    return null;
  }
}
