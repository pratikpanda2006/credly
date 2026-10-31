import type { User, Team, Post, AnalyticsData, VoteType } from '../types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status);
  }

  return data as T;
}

export const api = {
  // Auth
  signup: (body: { email: string; password: string; displayName?: string }) =>
    request<{ user: User; accessToken: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  // Teams
  getTeams: () => request<{ teams: Team[] }>('/teams'),

  createTeam: (name: string) =>
    request<{ team: Team }>('/teams', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  joinTeam: (joinCode: string) =>
    request<{ team: Team }>('/teams/join', {
      method: 'POST',
      body: JSON.stringify({ joinCode }),
    }),

  createDemoTeam: () =>
    request<{ team: Team }>('/teams/demo', {
      method: 'POST',
    }),

  getTeam: (id: string) => request<{ team: Team }>('/teams/' + id),

  updateTeam: (id: string, updates: { name?: string; weightByPosts?: boolean }) =>
    request<{ team: Team }>('/teams/' + id, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  leaveTeam: (id: string) =>
    request<{ success: boolean }>('/teams/' + id + '/members/me', {
      method: 'DELETE',
    }),

  removeMember: (teamId: string, userId: string) =>
    request<{ success: boolean }>('/teams/' + teamId + '/members/' + userId, {
      method: 'DELETE',
    }),

  // Posts
  getTeamPosts: (teamId: string) =>
    request<{ posts: Post[] }>('/teams/' + teamId + '/posts'),

  createPost: (teamId: string, text: string) =>
    request<{ post: Post }>('/teams/' + teamId + '/posts', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  deletePost: (postId: string) =>
    request<{ success: boolean }>('/posts/' + postId, {
      method: 'DELETE',
    }),

  voteOnPost: (postId: string, type: VoteType, reason?: string) =>
    request<{ vote: any; message: string }>('/posts/' + postId + '/vote', {
      method: 'POST',
      body: JSON.stringify({ type, reason }),
    }),

  getPostReasons: (postId: string) =>
    request<{ reasons: { id: string; voterName: string; reason: string; createdAt: string }[] }>(
      '/posts/' + postId + '/reasons'
    ),

  // Analytics
  getTeamAnalytics: (teamId: string) =>
    request<AnalyticsData>('/teams/' + teamId + '/analytics'),
};
