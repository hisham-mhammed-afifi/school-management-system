/**
 * Test setup helpers.
 *
 * Provides:
 * - An Express app instance driven by createServer()
 * - HTTP request helpers (get/post/patch/delete) that hit the app via supertest-like fetch
 * - Login helpers to obtain JWT tokens for different user roles
 * - DB cleanup utilities
 *
 * Integration tests need a running Postgres database referenced by DATABASE_URL
 * in .env.test (loaded via --env-file).
 */

import { createServer } from '../../src/server.ts';
import type { Server } from 'node:http';

let server: Server;
let baseUrl: string;

export async function startTestServer(): Promise<void> {
  const app = createServer();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
}

export async function stopTestServer(): Promise<void> {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

export function getBaseUrl(): string {
  return baseUrl;
}

// ---- HTTP helpers ----

interface RequestOptions {
  token?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

interface TestResponse {
  status: number;
  body: unknown;
  headers: Headers;
}

async function request(method: string, path: string, opts: RequestOptions = {}): Promise<TestResponse> {
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };
  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  const fetchOpts: RequestInit = {
    method,
    headers,
  };

  if (opts.body !== undefined) {
    fetchOpts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, fetchOpts);
  let body: unknown;
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, body, headers: res.headers };
}

export const api = {
  get: (path: string, opts?: RequestOptions) => request('GET', path, opts),
  post: (path: string, opts?: RequestOptions) => request('POST', path, opts),
  patch: (path: string, opts?: RequestOptions) => request('PATCH', path, opts),
  delete: (path: string, opts?: RequestOptions) => request('DELETE', path, opts),
};

// ---- Auth helpers ----

export async function login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await api.post('/api/v1/auth/login', {
    body: { email, password },
  });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const data = (res.body as { data: { accessToken: string; refreshToken: string } }).data;
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

export async function loginAsSuperAdmin(): Promise<string> {
  const { accessToken } = await login('superadmin@schoolms.com', 'SuperAdmin123!');
  return accessToken;
}

export async function loginAsSchoolAdmin(): Promise<string> {
  const { accessToken } = await login('admin@alnoor.edu.sa', 'Admin123!');
  return accessToken;
}
