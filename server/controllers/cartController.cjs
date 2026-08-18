const cartService = require('../services/cartService.cjs');
const orderService = require('../services/orderService.cjs');
const { logAudit } = require('../services/authService.cjs');

const getCart = async (req, res, next) => {
  try {
    const items = await cartService.getUserCart(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const item = await cartService.addToCart(req.user.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const result = await cartService.removeFromCart(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const checkout = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const order = await orderService.createOrderFromCart(userId, req.body);
    await logAudit({
      email: req.user?.email || req.body.phone || 'Guest Client',
      action: 'Order Placed',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: 'success',
      details: `Order #${order.id} — ₹${order.total_amount} (${order.payment_method || 'cod'})`,
    });
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  checkout,
};
