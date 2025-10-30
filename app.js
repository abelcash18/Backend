const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
dotenv.config();
const postRoute = require('./routes/post.route.js');
const authRoute = require('./routes/auth.route.js');
const testRoute = require('./routes/test.route.js');
const userRoute = require('./routes/user.route.js');
const User = require('./Models/userModel.js');


const app = express();

app.use(cors({origin: process.env.CLIENT_URL, credentials:true}));
app.use(express.json());
app.use(cookieParser());

app.use("/backend/auth", authRoute);
app.use("/users", userRoute);
app.use("/backend/posts", postRoute);
app.use("/backend/test", testRoute);

  

app.get('/auth/register', (req, res) => {
  // registration logic here
  res.status(200).send('User registered');
}); 


app.post('/auth/profile', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: 'Missing token' });
    }
    // Continue with profile logic...
});


app.post('/auth/login', async(req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }
  try {
    let user = await User.findOne({ email})
    if (!user){ 
    return res.status(404).json({ message: 'User not found' });
    } else {
      let isMatch = await bcrypt.compare(password, user.password)
      if(!isMatch){
    return res.status(401).json({ message: 'Invalid credentials' });
      } else {
    return res.status(200).json({ message: 'Login very successful', user });

      }
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



app.post('/auth/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

const URI = process.env.URI
mongoose.connect(URI)
.then((res) => {
    console.log("Database Connected!");
})
.catch((err) => {
    console.log("Database Connection Failed!", err.message);
});

app.listen(8800, () => {
    console.log("Server is Running!");
});