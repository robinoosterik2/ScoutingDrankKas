import type { IOrder } from "~/types";

export const useOrdersApi = () => {
  const createOrder = (
    orderData: Partial<IOrder> & {
      items: { productId: string; count: number }[];
    }
  ) => {
    return $fetch<IOrder>("/api/orders", {
      method: "POST",
      body: orderData,
    });
  };

  // Add fetchOrders if needed later

  return {
    createOrder,
  };
};
