const jwt = require('jsonwebtoken');
const verifyToken = require('./verifyToken.js')

exports.verifyToken = (req, res, next) => {
	const token = req.cookies?.token;
	if (!token) return res.status(401).json({ message: "Not authenticated!" });

	jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
		if (err) return res.status(403).json({ message: "Token is not valid!" });
		req.userId = payload?.id;
		next();
	});
};

module.exports = verifyToken;