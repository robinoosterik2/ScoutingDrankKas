export default defineEventHandler(async (event) => {
  // Extract order id from route params
  const { id } = event.context.params;

  if (!id) {
    throw createError({ statusCode: 400, message: 'Order ID is required' });
  }

  // Import model
  const { Order } = await import('../../models/order');
  
  try {
    // Find order by id
    let order = await Order.findById(id).populate('user', "firstName lastName").populate('bartender', "firstName lastName").populate('products.product');
    if (!order) {
      throw createError({ statusCode: 404, message: 'Order not found' });
    }
    // Populate related fields
    console.log(order);
    return order;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Error retrieving order'
    });
  }
});
