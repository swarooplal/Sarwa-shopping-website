'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPost, apiPut, apiPatch, apiDel } from '@/lib/api';

export function useBanners(position: string = 'HERO') {
  return useQuery({
    queryKey: ['banners', position],
    queryFn: () => apiGet<any[]>('/banners', { position }),
  });
}

export function useProducts(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiGet<any>('/products', params),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => apiGet<any[]>('/products/featured'),
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => apiGet<any[]>('/products/new-arrivals'),
  });
}

export function useTrendingProducts() {
  return useQuery({
    queryKey: ['products', 'trending'],
    queryFn: () => apiGet<any[]>('/products/trending'),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiGet<any>(`/products/${slug}`),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<any[]>('/categories'),
  });
}

export function useCategoryProducts(slug: string) {
  return useQuery({
    queryKey: ['products', { category: slug }],
    queryFn: () => apiGet<any>('/products', { category: slug }),
    enabled: !!slug,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => apiGet<any[]>('/collections'),
  });
}

export function useCollection(slug: string) {
  return useQuery({
    queryKey: ['collection', slug],
    queryFn: () => apiGet<any>(`/collections/${slug}`),
    enabled: !!slug,
  });
}

export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: () => apiGet<any[]>('/menus'),
  });
}

export function useReviews(productId?: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => apiGet<any[]>('/reviews', productId ? { productId } : undefined),
    enabled: !!productId,
  });
}

export function usePosts(slug?: string) {
  return useQuery({
    queryKey: ['blog', slug ?? 'list'],
    queryFn: () => apiGet<any>(slug ? `/blogs/${slug}` : '/blogs'),
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: ['page', slug],
    queryFn: () => apiGet<any>(`/cms/pages/${slug}`),
    enabled: !!slug,
  });
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => apiGet<any>('/search/autocomplete', { q }),
    enabled: q.length > 0,
  });
}

export function useContact() {
  return useMutation({ mutationFn: (body: any) => apiPost('/cms/contact', body) });
}

export function useSubscribe() {
  return useMutation({ mutationFn: (body: { email: string }) => apiPost('/cms/newsletter', body) });
}

export function useAdminDashboard() {
  return useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => apiGet<any>('/admin/dashboard') });
}

export function useAdminProducts(params: Record<string, any> = {}) {
  return useQuery({ queryKey: ['admin', 'products', params], queryFn: () => apiGet<any>('/products', params) });
}

export function useAdminOrders(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      const data: any[] = await apiGet<any[]>('/orders/admin', params);
      return data;
    },
  });
}

export function useAdminOrder(orderNumber?: string) {
  return useQuery({
    queryKey: ['admin', 'order', orderNumber],
    queryFn: () => apiGet<any>(`/orders/admin/${orderNumber}`),
    enabled: !!orderNumber,
  });
}

export function useAdminReviews() {
  return useQuery({ queryKey: ['admin', 'reviews'], queryFn: () => apiGet<any[]>('/reviews/admin') });
}

export function useAdminCustomers(params: Record<string, any> = {}) {
  return useQuery({ queryKey: ['admin', 'customers', params], queryFn: () => apiGet<any>('/admin/customers', params) });
}

export function useAdminCoupons() {
  return useQuery({ queryKey: ['admin', 'coupons'], queryFn: () => apiGet<any[]>('/coupons/admin') });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const result = data?.id ? await apiPut(`/products/${data.id}`, data) : await apiPost('/products', data);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDel(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      data?.id ? apiPut(`/categories/${data.id}`, data) : apiPost('/categories', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDel(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useSaveBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      data?.id ? apiPut(`/banners/${data.id}`, data) : apiPost('/banners', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDel(`/banners/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
}

export function useSaveMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      data?.id ? apiPut(`/menus/${data.id}`, data) : apiPost('/menus', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  });
}

export function useDeleteMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDel(`/menus/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  });
}

export function useReorderMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: any[]) => apiPut('/menus/reorder/bulk', items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/uploads', fd, {
        transformRequest: (d, headers) => {
          if (headers) delete (headers as any)['Content-Type'];
          return d;
        },
      });
      return res.data?.data;
    },
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      apiPatch(`/orders/admin/${id}/status`, { status, note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });
}

export function useApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reply }: { id: string; status: string; reply?: string }) =>
      apiPatch(`/reviews/admin/${id}`, { status, reply }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });
}

export function useSaveCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      data?.id ? apiPut(`/coupons/admin/${data.id}`, data) : apiPost('/coupons/admin', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDel(`/coupons/admin/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  });
}

export function useCustomer() {
  return useQuery({ queryKey: ['customer', 'profile'], queryFn: () => apiGet<any>('/customer/profile'), retry: false });
}
