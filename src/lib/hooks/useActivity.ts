'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { activityApi, type ActivityFilters } from '@/lib/api/activity';

export function useActivity(filters: ActivityFilters) {
  return useQuery({
    queryKey: ['admin', 'activity', filters],
    queryFn: async () => {
      const { data } = await activityApi.getAll(filters);
      return data.activity;
    },
    placeholderData: keepPreviousData,
  });
}
