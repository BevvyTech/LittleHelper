import { type SupportedLocale } from '../constants/locales.js';

import { type StorageType, type SyncStatus, type UserRole } from './api.js';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  banned: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Page {
  id: string;
  shortId: string;
  parentId: string | null;
  headerImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageLocale {
  id: string;
  pageId: string;
  locale: SupportedLocale;
  title: string;
  slug: string;
  summary: string | null;
  keywords: string[];
  markdownPath: string;
  headerImage: string | null;
  geminiLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Anchor {
  id: string;
  pageLocaleId: string;
  anchorId: string;
  hash: string;
  index: number;
  orphanedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentThread {
  id: string;
  pageLocaleId: string;
  anchorId: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  threadId: string;
  authorId: string | null;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Redirect {
  id: string;
  oldSlug: string;
  newSlug: string;
  locale: SupportedLocale;
  createdAt: Date;
}

export interface Release {
  id: string;
  tag: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface ReleasePageSnapshot {
  id: string;
  releaseId: string;
  pageLocaleId: string;
  slugAtRelease: string;
}

export interface SettingGroup {
  id: string;
  key: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageAsset {
  id: string;
  pageId: string | null;
  storageType: StorageType;
  storagePath: string;
  publicUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploaderId: string | null;
  createdAt: Date;
}

export interface SyncLog {
  id: string;
  status: SyncStatus;
  message: string | null;
  details: Record<string, unknown> | null;
  startedAt: Date;
  finishedAt: Date | null;
}
