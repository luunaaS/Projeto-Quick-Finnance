import api from './api.service';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

export const categoriesService = {
  // Get all categories for the authenticated user
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/categories');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch categories');
  },

  // Get categories by type (INCOME or EXPENSE)
  getCategoriesByType: async (type: 'INCOME' | 'EXPENSE'): Promise<Category[]> => {
    const response = await api.get<Category[]>(`/api/categories/type/${type}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch categories by type');
  },

  // Get main categories (no parent)
  getMainCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/categories/main');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch main categories');
  },

  // Get subcategories of a parent category
  getSubcategories: async (parentId: number): Promise<Category[]> => {
    const response = await api.get<Category[]>(`/api/categories/${parentId}/subcategories`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch subcategories');
  },

  // Get a specific category
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/api/categories/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch category');
  },

  // Create a new category
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<Category>('/api/categories', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create category');
  },

  // Update a category
  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put<Category>(`/api/categories/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update category');
  },

  // Delete a category
  deleteCategory: async (id: number): Promise<void> => {
    const response = await api.delete<{ message: string }>(`/api/categories/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete category');
    }
  },

  // Initialize default categories for a user
  initializeDefaultCategories: async (): Promise<void> => {
    const response = await api.post<{ message: string }>('/api/categories/initialize');
    if (!response.success) {
      throw new Error(response.error || 'Failed to initialize default categories');
    }
  },
};
