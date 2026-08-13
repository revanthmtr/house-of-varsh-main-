/**
 * House of Varsh — Entry Point Wrapper
 * Delegates execution to the Senior Layered Backend Architecture in ./server/server.cjs
 */
const app = require('./server/server.cjs');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n\x1b[32m[SENIOR BACKEND ONLINE]\x1b[0m House of Varsh API running on port \x1b[36m${PORT}\x1b[0m`);
});
