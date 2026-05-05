import { apiClient } from '@/lib/api-client';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'activated'
  | 'deactivated';

export type ActivityTargetType = 'Appointment' | 'User';

export interface ActivityLogEntry {
  _id: string;
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: string;
  targetLabel?: string;
  actorLabel?: string;
  actorId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  changes: Record<string, { from: unknown; to: unknown }>;
  ip?: string;
  createdAt: string;
}

export interface ActivityFilters {
  page?: number;
  limit?: number;
  action?: ActivityAction | '';
  targetType?: ActivityTargetType | '';
  actorId?: string;
  startDate?: string;
  endDate?: string;
  q?: string;
}

export interface PaginatedActivity {
  docs: ActivityLogEntry[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const activityApi = {
  getAll: (filters: ActivityFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value));
      }
    });
    return apiClient.get<{ activity: PaginatedActivity }>(`/admin/activity?${params.toString()}`);
  },
};
