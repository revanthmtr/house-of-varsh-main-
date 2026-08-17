const { queryAll, queryGet, queryRun, withTransaction } = require('../config/db.cjs');

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const parsePrice = (priceStr) => {
  const n = parseFloat(String(priceStr).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

// Creates a real order from the user's current cart within an atomic transaction.
// Snapshots item details (name/price/img) and clears the cart upon completion.
const createOrderFromCart = async (userId, shipping) => {
  const { name, phone, address, city, pincode, notes, payment_method } = shipping || {};

  if (!name || !phone || !address) {
    throw { status: 400, message: 'Shipping name, phone, and address are required.' };
  }

  return await withTransaction(async ({ queryAll: txQueryAll, queryRun: txQueryRun }) => {
    const cartItems = await txQueryAll('SELECT * FROM cart_items WHERE user_id = ?', [userId]);
    if (cartItems.length === 0) {
      throw { status: 400, message: 'Your cart is empty.' };
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + parsePrice(item.price), 0);

    const orderResult = await txQueryRun(
      `INSERT INTO orders
        (user_id, status, payment_method, total_amount, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_pincode, notes)
       VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, payment_method || 'cod', totalAmount, name, phone, address, city || null, pincode || null, notes || null]
    );

    const orderId = orderResult.lastID;

    for (const item of cartItems) {
      await txQueryRun(
        `INSERT INTO order_items (order_id, product_id, name, price, img, category, quantity)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [orderId, item.product_id, item.name, item.price, item.img, item.category]
      );
    }

    await txQueryRun('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    return await getOrderById(orderId, userId);
  });
};

const getOrderById = async (orderId, userId = null) => {
  const order = userId
    ? await queryGet('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId])
    : await queryGet('SELECT * FROM orders WHERE id = ?', [orderId]);

  if (!order) throw { status: 404, message: 'Order not found.' };

  const items = await queryAll('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return { ...order, items };
};

const getUserOrders = async (userId) => {
  const orders = await queryAll('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);
  if (orders.length === 0) return [];
  const items = await queryAll(
    `SELECT * FROM order_items WHERE order_id IN (${orders.map(() => '?').join(',')})`,
    orders.map((o) => o.id)
  );
  return orders.map((order) => ({
    ...order,
    items: items.filter((i) => i.order_id === order.id),
  }));
};

const getAllOrders = async ({ page, limit } = {}) => {
  let query = `
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.id DESC
  `;
  const params = [];

  if (limit) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);
  }

  const orders = await queryAll(query, params);
  if (orders.length === 0) return [];
  const items = await queryAll(
    `SELECT * FROM order_items WHERE order_id IN (${orders.map(() => '?').join(',')})`,
    orders.map((o) => o.id)
  );
  return orders.map((order) => ({
    ...order,
    items: items.filter((i) => i.order_id === order.id),
  }));
};

const updateOrderStatus = async (orderId, status) => {
  if (!VALID_STATUSES.includes(status)) {
    throw { status: 400, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` };
  }
  const result = await queryRun(
    `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    [status, orderId]
  );
  if (result.changes === 0) {
    throw { status: 404, message: 'Order not found.' };
  }
  return await getOrderById(orderId);
};

module.exports = {
  VALID_STATUSES,
  createOrderFromCart,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
