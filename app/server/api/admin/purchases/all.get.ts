export default defineEventHandler(async (event) => {
    const purchases = await Purchase.find().populate('userId', 'username').populate('productId', 'name');
    return purchases;
});
