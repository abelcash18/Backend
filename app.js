const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
dotenv.config();
const postRoute = require('./routes/post.route.js');
const authRoute = require('./routes/auth.route.js');
const testRoute = require('./routes/test.route.js');
const userRoute = require('./routes/userRoute.js');


const app = express();

app.use(cors({origin: process.env.CLIENT_URL, credentials:true}));
app.use(express.json());
app.use(cookieParser());

app.use("/backend/auth", authRoute);
app.use("/backend/users", userRoute);
app.use("/backend/posts", postRoute);
app.use("/backend/test", testRoute);

  
    
  app.use("/backend/auth/register", (req, res)=>{
      res.send("It works!")
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