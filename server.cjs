/**
 * House of Varsh — Entry Point Wrapper
 * Delegates execution to the Senior Layered Backend Architecture in ./server/server.cjs
 */
require('dotenv').config();

// ── Built-in Payment Gateway Defaults ──────────────────────────────────────────
// These allow the backend to work on Render/production with zero env var config.
// To use live keys: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render dashboard.
if (!process.env.RAZORPAY_KEY_ID)     process.env.RAZORPAY_KEY_ID     = 'rzp_test_TRB4I5DXNkWEeW';
if (!process.env.RAZORPAY_KEY_SECRET) process.env.RAZORPAY_KEY_SECRET = 'IgZjRgxOtTIkiHT5VefAXS61';

const app = require('./server/server.cjs');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n\x1b[32m[SENIOR BACKEND ONLINE]\x1b[0m House of Varsh API running on port \x1b[36m${PORT}\x1b[0m`);
});
