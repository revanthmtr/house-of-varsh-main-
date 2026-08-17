const adminService = require('../services/adminService.cjs');
const orderService = require('../services/orderService.cjs');

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await adminService.getAuditLogs();
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await adminService.getAllOrders(req.query);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs,
  getUsers,
  getOrders,
  updateOrderStatus,
};
