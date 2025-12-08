import { type ApiError } from '../constants/errors.js';

export interface ApiResponse<T> {
  data: T;
}

export interface ApiResponseWithMeta<T, M = PaginationMeta> {
  data: T;
  meta: M;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export type UserRole = 'USER' | 'ADMIN';

export type SyncStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING';

export type StorageType = 'LOCAL' | 'S3';
