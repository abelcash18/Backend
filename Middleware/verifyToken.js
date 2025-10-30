const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
	const token = req.cookies?.token;
	if (!token) return res.status(401).json({ message: "Not authenticated!" });

	// Support either env var name for backwards compatibility
	const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
	jwt.verify(token, secret, (err, payload) => {
		if (err) return res.status(403).json({ message: "Token is not valid!" });
		req.userId = payload?.id;
		req.isAdmin = Boolean(payload?.isAdmin);
		next();
	});
}

module.exports = { verifyToken };