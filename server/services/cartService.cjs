const { queryAll, queryGet, queryRun } = require('../config/db.cjs');

const getUserCart = async (userId) => {
  return await queryAll('SELECT * FROM cart_items WHERE user_id = ? ORDER BY id DESC', [userId]);
};

const addToCart = async (userId, { product_id, name, price, img, category }) => {
  if (product_id) {
    const product = await queryGet('SELECT is_sold_out FROM products WHERE id = ?', [product_id]);
    if (product && (product.is_sold_out === true || product.is_sold_out === 1 || product.is_sold_out === 'true')) {
      throw { status: 400, message: 'This piece is currently sold out and cannot be added to bag.' };
    }
  }

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
