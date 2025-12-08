const express = require('express');
const router = express.Router();

let shouldBeAdmin;
let shouldBeLoggedIn;
try {
	const auth = require('../middlewares/auth.middleware');
	shouldBeAdmin = auth && auth.shouldBeAdmin;
	shouldBeLoggedIn = auth && auth.shouldBeLoggedIn;
} catch (err) {
}

const handlers = [];
if (typeof shouldBeLoggedIn === 'function') handlers.push(shouldBeLoggedIn);
if (typeof shouldBeAdmin === 'function') handlers.push(shouldBeAdmin);

handlers.push((req, res) => {
	return res.status(200).json({ message: 'Test route OK' });
});

router.get('/test', ...handlers);

module.exports = router;