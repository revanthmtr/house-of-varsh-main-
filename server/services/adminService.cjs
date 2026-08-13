const { queryAll } = require('../config/db.cjs');
const orderService = require('./orderService.cjs');

const getAuditLogs = async () => {
  return await queryAll('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200');
};

const getAllUsers = async () => {
  const query = `
    SELECT 
      u.id, u.name, u.email, u.role, 
      u.auth_method, u.google_id,
      u.created_at, u.last_login,
      u.login_count, u.last_ip, u.last_device
    FROM users u
    ORDER BY u.id DESC
  `;
  return await queryAll(query);
};

const getAllOrders = async () => {
  return await orderService.getAllOrders();
};

module.exports = {
  getAuditLogs,
  getAllUsers,
  getAllOrders,
};
