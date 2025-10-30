const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const User = require('../Models/userModel.js')
const property = require('../Models/propertyModel.js')


const JWT_EXPIRES_DAYS = 7;
const jwtExpiry = `${JWT_EXPIRES_DAYS}d`;
const cookieMaxAgeMs = JWT_EXPIRES_DAYS * 24 * 60 * 60 * 1000; // 7 days in ms

exports.register = async (req, res) => {
    const { username, email, password} = req.body || {};
    if (!username || !email || !password ) {
        return res.status(400).json({ message: "username, email and password are required" });
    }
     try {
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(409).json({ message: "Username already taken" });
        }
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(409).json({ message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword })
        await newUser.save();
        console.log('User saved');

        return res.status(201).json({ message: "User created successfully"});
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Failed to create user" });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({ message: "username and password are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });


        const token = jwt.sign({ id: user.id, isAdmin: true,}, 
            process.env.JWT_SECRET, { expiresIn: jwtExpiry })

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: cookieMaxAgeMs,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        return res.status(200).json({message: 'Login successfully', user, token});
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Failed to login" });
    }
};

exports.logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
    }
};