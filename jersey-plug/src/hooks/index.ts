'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, Order } from '@/types';

// ── useAuth ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jp_token');
    if (!token) { setIsLoading(false); return; }
    api.get('/auth/verify')
      .then(() => setIsAuthenticated(true))
      .catch(() => { localStorage.removeItem('jp_token'); localStorage.removeItem('jp_user'); })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true); setError(null);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('jp_token', data.data.token);
      localStorage.setItem('jp_user', data.data.username);
      setIsAuthenticated(true);
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed');
      return false;
    } finally { setIsLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('jp_token');
    localStorage.removeItem('jp_user');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, error, login, logout };
}

// ── useProducts ──────────────────────────────────────────────────────────────
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data as { success: boolean; data: Product[] };
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string; price: number; stock: number;
      description?: string; category?: string;
      images: string[]; variants: Array<{ name: string; price: number }>;
    }) => {
      const { data } = await api.post('/products', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/products/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

// ── useOrders ────────────────────────────────────────────────────────────────
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return data as { success: boolean; data: Order[] };
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (payload: {
      customerName: string; phone: string; location: string;
      items: Array<{ productId: number; productName: string; variant: string; quantity: number; unitPrice: number; image: string; }>;
    }) => {
      const { data } = await api.post('/orders', payload);
      return data;
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.patch(`/orders/${id}`, { status });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// ── useUpload ────────────────────────────────────────────────────────────────
export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, filename: string): Promise<string | null> => {
    setIsUploading(true); setProgress(0);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('filename', filename);
      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => { if (e.total) setProgress(Math.round((e.loaded / e.total) * 100)); },
      });
      return data.data?.url ?? null;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    } finally { setIsUploading(false); setProgress(0); }
  };

  return { upload, isUploading, progress };
}
