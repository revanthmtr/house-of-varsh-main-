const paymentService = require('../services/paymentService.cjs');
const { logAudit } = require('../services/authService.cjs');


const parsePrice = (priceStr) => {
  const n = parseFloat(String(priceStr).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

/**
 * Initiates Razorpay payment order
 */
const createOrder = async (req, res, next) => {
  try {
    const { amount, items } = req.body;
    let finalAmount = parseFloat(amount);

    if ((!finalAmount || finalAmount <= 0) && Array.isArray(items)) {
      finalAmount = items.reduce((sum, item) => sum + parsePrice(item.price), 0);
    }

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({ error: 'Cannot create payment order with zero or invalid amount.' });
    }

    const userId = req.user ? req.user.id : null;
    const userEmail = req.user?.email || '';

    const orderData = await paymentService.createRazorpayOrder({
      amount: finalAmount,
      receipt: `hov_${userId || 'guest'}_${Date.now()}`,
      notes: {
        userId: String(userId || 'guest'),
        userEmail: userEmail,
      },
    });

    res.json(orderData);
  } catch (err) {
    next(err);
  }
};

/**
 * Cryptographically verifies Razorpay payment and confirms the order
 */
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shipping,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required Razorpay payment verification parameters.' });
    }

    // Step 1: Cryptographic HMAC SHA256 Signature Verification
    const isValid = paymentService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      await logAudit({
        email: req.user?.email || shipping?.phone || 'Unknown',
        action: 'Payment Signature Tampering Detected',
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'failed',
        details: `Invalid signature for Razorpay Order ${razorpay_order_id}`,
      });

      return res.status(400).json({
        success: false,
        error: 'Payment signature verification failed. Transaction cannot be authenticated.',
      });
    }

    const userId = req.user ? req.user.id : null;

    // Step 2: Create Confirmed Order in Database
    const order = await paymentService.createVerifiedOrder(userId, shipping, {
      razorpay_payment_id,
      razorpay_order_id,
    });

    // Step 3: Record Audit Log
    await logAudit({
      email: req.user?.email || shipping?.phone || 'Guest Client',
      action: 'Payment Verified & Order Confirmed',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: 'success',
      details: `Order #${order.id} — Paid ₹${order.total_amount} via Razorpay (${razorpay_payment_id})`,
    });


    res.json({
      success: true,
      order,
      message: 'Payment verified and order confirmed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
