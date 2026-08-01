import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getProducts = (params) => api.get('/products', { params }).then(r => r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then(r => r.data);
export const createProduct = (data) => api.post('/products', data).then(r => r.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getCategories = () => api.get('/categories').then(r => r.data);
export const createCategory = (data) => api.post('/categories', data).then(r => r.data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data).then(r => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getTransactions = (params) => api.get('/transactions', { params }).then(r => r.data);
export const createTransaction = (data) => api.post('/transactions', data).then(r => r.data);

export const getSummary = () => api.get('/reports/summary').then(r => r.data);
export const getLowStock = () => api.get('/reports/low-stock').then(r => r.data);
export const getStockByDay = (days) => api.get('/reports/stock-by-day', { params: { days } }).then(r => r.data);
export const getTopProducts = (limit) => api.get('/reports/top-products', { params: { limit } }).then(r => r.data);

export const exportProductsUrl = '/api/reports/export/products';
export const exportTransactionsUrl = '/api/reports/export/transactions';

export function apiErrorMessage(err, t) {
  const body = err?.response?.data;
  const code = body?.error;
  if (!code) return t('errors.UNKNOWN');
  return t(`errors.${code}`, { ...body?.data, defaultValue: t('errors.UNKNOWN') });
}

export default api;
