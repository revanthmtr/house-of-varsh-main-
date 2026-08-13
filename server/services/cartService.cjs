const { queryAll, queryRun } = require('../config/db.cjs');

const getUserCart = async (userId) => {
  return await queryAll('SELECT * FROM cart_items WHERE user_id = ? ORDER BY id DESC', [userId]);
};

const addToCart = async (userId, { product_id, name, price, img, category }) => {
  const result = await queryRun(
    'INSERT INTO cart_items (user_id, product_id, name, price, img, category) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, product_id, name, price, img, category]
  );
  return { id: result.lastID, user_id: userId, product_id, name, price, img, category };
};

const removeFromCart = async (userId, cartItemId) => {
  await queryRun('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [cartItemId, userId]);
  return { success: true };
};

const clearCart = async (userId) => {
  await queryRun('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  return { success: true, message: 'Checkout successful.' };
};

module.exports = {
  getUserCart,
  addToCart,
  removeFromCart,
  clearCart,
};
