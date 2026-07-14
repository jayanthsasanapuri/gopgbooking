require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require("./config/passport");
const googleAuthRouter = require("./routes/googleAuthRouter");
const homeController = require("./controllers/homeController");
const {MongoStore} = require("connect-mongo");
const app = express();
const path = require('path');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.get("/", homeController.getHome);
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  console.log('Connected to MongoDB');
}).catch((err)=>{
  console.error('Error connecting to MongoDB:', err);
})
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions"
    })
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(googleAuthRouter);
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});
const hostRouter = require('./routes/hostRouter');
const authRouter = require('./routes/authRouter');
const adminRouter = require('./routes/adminRouter');
const wishlistController = require('./routes/wishlistRouter');
app.use(hostRouter);
app.use(authRouter);
app.use('/admin', adminRouter);
app.use(wishlistController);
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
  console.log(`http://localhost:${PORT}`)
})
