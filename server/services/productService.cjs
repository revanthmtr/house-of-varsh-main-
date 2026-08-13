const { queryAll, queryRun } = require('../config/db.cjs');

const getAllProducts = async () => {
  return await queryAll('SELECT * FROM products ORDER BY id DESC');
};

const createProduct = async ({ name, price, category, img, badge }) => {
  const result = await queryRun(
    'INSERT INTO products (name, price, category, img, badge) VALUES (?, ?, ?, ?, ?)',
    [name, price, category, img, badge]
  );
  return { id: result.lastID, name, price, category, img, badge };
};

const updateProduct = async (id, { name, price, category, img, badge }) => {
  await queryRun(
    'UPDATE products SET name = ?, price = ?, category = ?, img = ?, badge = ? WHERE id = ?',
    [name, price, category, img, badge, id]
  );
  return { id, name, price, category, img, badge };
};

const deleteProduct = async (id) => {
  await queryRun('DELETE FROM products WHERE id = ?', [id]);
  return { id, deleted: true };
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
