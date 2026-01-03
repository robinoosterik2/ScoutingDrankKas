import type { IProduct, ICategory } from "~/types";

export const useProductsApi = () => {
  const fetchProducts = () => {
    return useFetch<IProduct[]>("/api/products");
  };

  const createProduct = (productData: Partial<IProduct>) => {
    return $fetch<IProduct>("/api/products", {
      method: "POST",
      body: productData,
    });
  };

  const updateProduct = (id: string, updates: Partial<IProduct>) => {
    return $fetch<IProduct>(`/api/products/${id}`, {
      method: "PUT",
      body: updates,
    });
  };

  const deleteProduct = (id: string) => {
    return $fetch(`/api/products/${id}`, { method: "DELETE" });
  };

  const fetchCategories = () => {
    return useFetch<ICategory[]>("/api/categories");
  };

  const createCategory = (categoryData: Partial<ICategory>) => {
    return $fetch<ICategory>("/api/categories", {
      method: "POST",
      body: categoryData,
    });
  };

  return {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    createCategory,
  };
};
