const Razorpay = require('razorpay');
const crypto = require('crypto');
const { queryAll, queryGet, queryRun, withTransaction } = require('../config/db.cjs');

const parsePrice = (priceStr) => {
  const n = parseFloat(String(priceStr).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

// Initialize Razorpay instance lazily or safely
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw { status: 500, message: 'Razorpay API credentials are not configured on the server.' };
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

/**
 * Creates an order on Razorpay servers in INR (amount in paise)
 */
const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const razorpay = getRazorpayInstance();
  const amountInPaise = Math.round(amount * 100);

  if (isNaN(amountInPaise) || amountInPaise <= 0) {
    throw { status: 400, message: 'Invalid order amount.' };
  }

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: String(receipt || `rcpt_${Date.now()}`),
    notes,
  };

  const order = await razorpay.orders.create(options);
  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

/**
 * Cryptographically verifies the Razorpay payment signature
 * generated using HMAC SHA256 of order_id + "|" + payment_id
 */
const verifyPaymentSignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw { status: 500, message: 'Razorpay Secret Key is missing on the server.' };
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;
  return isAuthentic;
};

/**
 * Saves a completed online order to PostgreSQL with status 'confirmed' and clears the cart
 */
const createVerifiedOrder = async (userId, shipping, paymentDetails) => {
  const { name, phone, address, city, pincode, notes, items } = shipping || {};
  const { razorpay_payment_id, razorpay_order_id } = paymentDetails || {};

  if (!name || !phone || !address) {
    throw { status: 400, message: 'Shipping name, phone, and address are required.' };
  }

  const orderId = await withTransaction(async ({ queryAll: txQueryAll, queryRun: txQueryRun }) => {
    let cartItems = await txQueryAll('SELECT * FROM cart_items WHERE user_id = ?', [userId]);

    if (cartItems.length === 0 && Array.isArray(items) && items.length > 0) {
      cartItems = items;
    }

    if (cartItems.length === 0) {
      throw { status: 400, message: 'Your bag is empty.' };
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + parsePrice(item.price), 0);

    const orderResult = await txQueryRun(
      `INSERT INTO orders
        (user_id, status, payment_method, payment_id, total_amount, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_pincode, notes)
       VALUES (?, 'confirmed', 'razorpay', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, razorpay_payment_id, totalAmount, name, phone, address, city || null, pincode || null, notes ? `${notes} (Razorpay Order: ${razorpay_order_id})` : `Razorpay Order: ${razorpay_order_id}`]
    );

    const newOrderId = orderResult.lastID;

    for (const item of cartItems) {
      await txQueryRun(
        `INSERT INTO order_items (order_id, product_id, name, price, img, category, quantity)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [newOrderId, item.product_id || 0, item.name, String(item.price), item.img || '', item.category || 'new']
      );
    }

    await txQueryRun('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    return newOrderId;
  });

  const order = await queryGet('SELECT * FROM orders WHERE id = ?', [orderId]);
  const orderItems = await queryAll('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return { ...order, items: orderItems };
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  createVerifiedOrder,
};
