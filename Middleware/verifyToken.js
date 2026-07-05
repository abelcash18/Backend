const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
	let token = req.cookies?.token;

	// Support Authorization: Bearer <token> header for cross-site cookie restrictions
	if (!token && req.headers.authorization) {
		const authHeader = req.headers.authorization;
		if (authHeader.startsWith("Bearer ")) {
			token = authHeader.split(" ")[1];
		}
	}

	if (!token) return res.status(401).json({ message: "Not authenticated!" });

	const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
	jwt.verify(token, secret, (err, payload) => {
		if (err) return res.status(403).json({ message: "Token is not valid!" });
		req.userId = payload?.id || payload?._id;
		req.isAdmin = Boolean(payload?.isAdmin);
		next();
	});
}

module.exports = { verifyToken };