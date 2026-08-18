const { queryAll, queryRun } = require('../config/db.cjs');

const getAllProducts = async ({ page, limit, category } = {}) => {
  let sql = 'SELECT * FROM products';
  const params = [];

  if (category) {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  sql += ' ORDER BY id DESC';

  if (limit) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    sql += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);
  }

  return await queryAll(sql, params);
};

const createProduct = async ({ name, price, category, img, badge, is_sold_out }) => {
  const soldOutVal = is_sold_out === true || is_sold_out === 'true' || is_sold_out === 1 ? true : false;
  const result = await queryRun(
    'INSERT INTO products (name, price, category, img, badge, is_sold_out) VALUES (?, ?, ?, ?, ?, ?)',
    [name, price, category, img, badge || null, soldOutVal]
  );
  return { id: result.lastID, name, price, category, img, badge, is_sold_out: soldOutVal };
};

const updateProduct = async (id, { name, price, category, img, badge, is_sold_out }) => {
  const soldOutVal = is_sold_out === true || is_sold_out === 'true' || is_sold_out === 1 ? true : false;
  await queryRun(
    'UPDATE products SET name = ?, price = ?, category = ?, img = ?, badge = ?, is_sold_out = ? WHERE id = ?',
    [name, price, category, img, badge || null, soldOutVal, id]
  );
  return { id, name, price, category, img, badge, is_sold_out: soldOutVal };
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
