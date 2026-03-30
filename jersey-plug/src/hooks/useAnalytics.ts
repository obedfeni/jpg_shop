'use client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics');
      return data as {
        success: boolean;
        data: {
          totalVisits: number;
          totalUnique: number;
          todayVisits: number;
          todayUnique: number;
          last7Days: Array<{ date: string; visits: number; uniqueVisitors: number }>;
        };
      };
    },
  });
}

export function useRecordVisit() {
  useEffect(() => {
    const key = `visited_${new Date().toISOString().split('T')[0]}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetch('/api/analytics', { method: 'POST' }).catch(() => {});
  }, []);
}
