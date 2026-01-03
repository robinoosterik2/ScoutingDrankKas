import { defineStore } from "pinia";
import { useOrdersApi } from "~/composables/useOrdersApi";
import type { IProduct, IUser } from "~/types";

export const useCartStore = defineStore("cart", () => {
  const items = useState<{ product: IProduct; quantity: number }[]>(
    "cart_items",
    () => []
  );
  const selectedUser = useState<IUser | null>("cart_selected_user", () => null);
  const selectedGuest = useState<IUser | null>(
    "cart_selected_guest",
    () => null
  ); // Assuming guests are also users or similar
  const loading = useState<boolean>("cart_loading", () => false);

  const { createOrder } = useOrdersApi();

  const total = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  });

  function addItem(product: IProduct, quantity: number = 1) {
    const existingItem = items.value.find((i) => i.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({ product, quantity });
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter((i) => i.product.id !== productId);
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find((i) => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        removeItem(productId);
      }
    }
  }

  function clearCart() {
    items.value = [];
    selectedUser.value = null;
    selectedGuest.value = null;
  }

  async function checkout() {
    if (items.value.length === 0) return;

    loading.value = true;
    try {
      const orderData = {
        userId: selectedUser.value?.id || "",
        guestId: selectedGuest.value?.id,
        items: items.value.map((i) => ({
          productId: i.product.id,
          count: i.quantity,
        })),
        total: total.value,
      };

      await createOrder(orderData);

      clearCart();
      return true;
    } catch (error) {
      console.error("Checkout failed", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    selectedUser,
    selectedGuest,
    total,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    checkout,
  };
});
