const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

// ── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential token is required'),
});

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.string().or(z.number()).transform(String),
  category: z.string().min(1, 'Category is required'),
  img: z.string().min(1, 'Image URL is required'),
  badge: z.string().nullable().optional(),
});

const addToCartSchema = z.object({
  product_id: z.number().int().optional(),
  name: z.string().min(1, 'Item name is required'),
  price: z.string().or(z.number()).transform(String),
  img: z.string().optional(),
  category: z.string().optional(),
});

const checkoutSchema = z.object({
  name: z.string().min(1, 'Shipping recipient name is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  address: z.string().min(5, 'Shipping address is required'),
  city: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  payment_method: z.enum(['cod', 'online', 'razorpay']).default('cod'),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be one of: pending, confirmed, shipped, delivered, cancelled' }),
  }),
});

const updateContentSchema = z.object({
  value: z.string({ required_error: 'value is required' }),
});

const bulkUpdateContentSchema = z.object({
  fields: z.record(z.any(), { required_error: 'fields object is required' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  productSchema,
  addToCartSchema,
  checkoutSchema,
  updateOrderStatusSchema,
  updateContentSchema,
  bulkUpdateContentSchema,
};

