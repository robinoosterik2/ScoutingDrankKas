import { defineStore } from "pinia";
import { useProductsApi } from "~/composables/useProductsApi";
import type { IProduct, ICategory } from "~/types";

export const useProductsStore = defineStore("products", () => {
  const products = useState<IProduct[]>("products_list", () => []);
  const categories = useState<ICategory[]>("categories_list", () => []);
  const loading = useState<boolean>("products_loading", () => false);

  const {
    fetchProducts: apiFetchProducts,
    createProduct: apiCreateProduct,
    updateProduct: apiUpdateProduct,
    deleteProduct: apiDeleteProduct,
    fetchCategories: apiFetchCategories,
    createCategory: apiCreateCategory,
  } = useProductsApi();

  async function fetchProducts() {
    loading.value = true;
    try {
      const { data, error } = await apiFetchProducts();
      if (error.value) throw error.value;
      if (data.value) {
        products.value = data.value;
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(productData: Partial<IProduct>) {
    loading.value = true;
    try {
      const newProduct = await apiCreateProduct(productData);
      products.value.push(newProduct);
      return newProduct;
    } catch (error) {
      console.error("Failed to create product", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(id: string, updates: Partial<IProduct>) {
    loading.value = true;
    try {
      const updatedProduct = await apiUpdateProduct(id, updates);
      const index = products.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        products.value[index] = updatedProduct;
      }
      return updatedProduct;
    } catch (error) {
      console.error("Failed to update product", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id: string) {
    loading.value = true;
    try {
      await apiDeleteProduct(id);
      products.value = products.value.filter((p) => p.id !== id);
    } catch (error) {
      console.error("Failed to delete product", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    loading.value = true;
    try {
      const { data, error } = await apiFetchCategories();
      if (error.value) throw error.value;
      if (data.value) {
        categories.value = data.value;
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(categoryData: Partial<ICategory>) {
    loading.value = true;
    try {
      const newCategory = await apiCreateCategory(categoryData);
      categories.value.push(newCategory);
      return newCategory;
    } catch (error) {
      console.error("Failed to create category", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    products,
    categories,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    createCategory,
  };
});
