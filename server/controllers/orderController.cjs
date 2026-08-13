const orderService = require('../services/orderService.cjs');

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const getMyOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyOrders,
  getMyOrderById,
};
