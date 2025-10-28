const express = require('express');
const router = express.Router();

// Safely attempt to load optional auth middleware without breaking if it doesn't exist
let shouldBeAdmin;
let shouldBeLoggedIn;
try {
	// adjust path if your middleware lives elsewhere
	const auth = require('../middlewares/auth.middleware');
	shouldBeAdmin = auth && auth.shouldBeAdmin;
	shouldBeLoggedIn = auth && auth.shouldBeLoggedIn;
} catch (err) {
	// middleware not found or failed to load — ignore, we'll use no-op handlers
}

// Build handlers array only with functions to avoid "argument handler must be a function"
const handlers = [];
if (typeof shouldBeLoggedIn === 'function') handlers.push(shouldBeLoggedIn);
if (typeof shouldBeAdmin === 'function') handlers.push(shouldBeAdmin);

// final route handler
handlers.push((req, res) => {
	return res.status(200).json({ message: 'Test route OK' });
});

router.get('/test', ...handlers);

module.exports = router;