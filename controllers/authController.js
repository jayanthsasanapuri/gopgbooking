const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const resend = require("../config/mailer");
exports.getLogin = (req,res,next) =>{
    res.render('auth/Login',{error:null,isLoggedIn:false});
}
exports.getSignup = (req,res,next) =>{
    res.render('auth/Signup',{error:null,isLoggedIn:false});
}

exports.postSignup = async (req,res,next) =>{
    const {firstName,lastName,email,password} = req.body;
    if(password!==req.body.confirm){
        return res.render('auth/Signup',{error:'Passwords do not match.',isLoggedIn:false});
    }
    const existingUser = await User.findOne({email:email});
    if(existingUser){
       return res.render('auth/Signup',{error:'Email already registered.',isLoggedIn:false});
    }
    const hashedPassword = await bcrypt.hash(password,12);
    const user =  new User({
        firstName,
        lastName,
        email,
        password:hashedPassword
    });
    await user.save()
    .then(()=>{
        res.redirect('/login');
    })
    .catch(err=>{
        console.log(err);
        res.render('auth/Signup',{error:'An error occurred. Please try again.',isLoggedIn:false
    })
    })
    
}
exports.postLogin = async(req,res,next)=>{
    const {email,password} = req.body;
    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
        req.session.admin = true;
        return res.redirect('admin/dashboard');
    }
    const user = await User.findOne({email});
    if(!user){
        return res.render('auth/Login',{error:'Invalid email or password.',isLoggedIn:false});
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.render('auth/Login',{error:'Invalid email or password.',isLoggedIn:false});
    }
    req.session.user = {
    userId: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
    };
    req.session.save(()=>{

    res.redirect("/card");

});
    
}
exports.postLogout = (req,res,next)=>{
    req.session.destroy(err=>{
        if(err){
            console.log(err);
            return res.redirect('/home');
        }
        res.clearCookie("connect.sid");
        res.redirect('/login');
    })
}

exports.getForgotPassword = (req, res, next) => {
    res.render('auth/forgotpassword', { error: null, isLoggedIn: false ,success:null});
}
exports.postForgotPassword = async (req, res, next) => {
    try{
    const { email } = req.body;
    const user = await User.findOne({ email });
    if(!user){
        return res.render('auth/forgotpassword', { error: 'Email not registered.', isLoggedIn: false ,success:null});
    }
    const otp = Math.floor(100000 + Math.random()*900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now()+5*60*1000;
    await user.save();
    await resend.emails.send({
    from: "GoPGBooking <onboarding@resend.dev>",
    to: user.email,
    subject: "gopgbooking Password Reset OTP",
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color:#16a34a;">
                GoPGBooking
            </h2>
            <p>Hello <strong>${user.firstName}</strong>,</p>

            <p>You requested to reset your password.</p>

            <p>Your OTP is:</p>

            <h1 style="letter-spacing:5px; color:#16a34a;">
                ${otp}
            </h1>

            <p>
                This OTP is valid for <strong>5 minutes</strong>.
            </p>

            <p>
                Please do not share this OTP with anyone.
            </p>

            <br>

            <p>Regards,</p>

            <p>
                <strong>GoPGBooking Team</strong>
            </p>
        </div>
    `
});
    res.redirect("/verify-otp?email=" + encodeURIComponent(user.email));
   }
   catch(err){
        console.log(err);
        res.status(500).send("Something went wrong.");
   }

}
exports.getVerifyOtp = (req, res, next) => {
    const email = req.query.email;
    res.render('auth/verifyotp', { error: null, isLoggedIn: false, email });
}
exports.postVerifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if(!user){
             return res.render("auth/verifyotp", {
                email,
                error: "User not found."
            });
        }
         if (!user.otp || !user.otpExpiry) {
            return res.render("auth/verifyotp", {
                email,
                error: "Please request a new OTP."
            });
        }
          if (Date.now() > user.otpExpiry) {
            return res.render("auth/verifyotp", {
                email,
                error: "OTP has expired."

            });

        }
        if (user.otp !== otp) {
            return res.render("auth/verifyotp", {
                email,
                error: "Invalid OTP."
            });
        }
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.redirect("/reset-password?email=" + encodeURIComponent(user.email));
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong.");
    }

    };
exports.getResetPassword = (req, res, next) => {
    const email = req.query.email;
    res.render('auth/resetpassword', { error: null, isLoggedIn: false, email ,success:null});
}
exports.postResetPassword = async (req, res, next) => {

    try {

        const { email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render("auth/resetpassword", {
                email,
                error: "Passwords do not match.",
                success: null
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("auth/resetpassword", {
                email,
                error: "User not found.",
                success: null
            });

        }
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.render("auth/login", {
            error: null,
            success: "Password reset successfully. Please login."
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong.");

    }

};
