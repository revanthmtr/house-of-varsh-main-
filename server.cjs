/**
 * House of Varsh — Entry Point Wrapper
 * Delegates execution to the Senior Layered Backend Architecture in ./server/server.cjs
 */
require('dotenv').config();

// ── Built-in Payment Gateway Defaults (LIVE PRODUCTION) ────────────────────────
// These allow the backend to work on Render/production seamlessly.
if (!process.env.RAZORPAY_KEY_ID)     process.env.RAZORPAY_KEY_ID     = 'rzp_live_TRD6mlUZHguUAm';
if (!process.env.RAZORPAY_KEY_SECRET) process.env.RAZORPAY_KEY_SECRET = 'Oh6FXaAJdnOHNQhE4yNJAxEa';


const app = require('./server/server.cjs');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n\x1b[32m[SENIOR BACKEND ONLINE]\x1b[0m House of Varsh API running on port \x1b[36m${PORT}\x1b[0m`);
});
