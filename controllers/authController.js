const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const transporter = require('../config/mailer');
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
    res.render('auth/forgotpassword', { error: null, isLoggedIn: false, success: null });
};
exports.postForgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/forgotpassword', {
                error: 'Email not registered.',
                isLoggedIn: false,
                success: null
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        await user.save();
        const otpEmailHtml = `
<div style="
    font-family:'Segoe UI',Arial,sans-serif;
    max-width:600px;
    margin:30px auto;
    background:#ffffff;
    border:1px solid #e5e7eb;
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 8px 25px rgba(0,0,0,0.08);
">

    <!-- Header -->

    <div style="
        background:linear-gradient(135deg,#183b67,#22c55e);
        padding:25px;
        text-align:center;
    ">

        <h1 style="
            margin:0;
            font-size:32px;
            color:#ffffff;
            font-weight:700;
        ">
            <span style="color:#8df5b1;">gopg</span>booking
        </h1>

    </div>

    <!-- Body -->

    <div style="padding:35px;">

        <h2 style="
            margin-top:0;
            color:#183b67;
        ">
            Password Reset
        </h2>

        <p style="
            color:#444;
            font-size:16px;
            line-height:1.7;
        ">
            Hello <strong>${user.firstName}</strong>,
        </p>

        <p style="
            color:#555;
            line-height:1.8;
        ">
            We received a request to reset your password for your
            <strong>gopgbooking</strong> account.
        </p>

        <p style="
            color:#555;
            margin-top:25px;
        ">
            Your verification code is:
        </p>

        <div style="
            text-align:center;
            margin:30px 0;
        ">

            <span style="
                display:inline-block;
                background:#f0fff4;
                border:2px dashed #22c55e;
                color:#16a34a;
                padding:18px 35px;
                border-radius:12px;
                font-size:38px;
                font-weight:700;
                letter-spacing:10px;
            ">
                ${otp}
            </span>

        </div>

        <p style="
            color:#555;
            line-height:1.8;
        ">
            This OTP is valid for
            <strong style="color:#16a34a;">
                5 minutes
            </strong>.
        </p>

        <p style="
            color:#e11d48;
            font-weight:600;
        ">
            ⚠ Never share this OTP with anyone.
        </p>

        <hr style="
            border:none;
            border-top:1px solid #e5e7eb;
            margin:30px 0;
        ">

        <p style="
            color:#555;
            margin-bottom:6px;
        ">
            Regards,
        </p>

        <p style="
            color:#183b67;
            font-weight:700;
            font-size:17px;
        ">
            gopgbooking Team
        </p>

    </div>

</div>
`;
        try {
            const info = await transporter.sendMail({
                from: `"GoPGBooking" <${process.env.GMAIL_USER}>`,
                to: user.email,
                subject: "Your Password Reset OTP",
                html: otpEmailHtml
            });
            console.log("Email sent:", info.messageId);
        } catch (err) {
            console.error("Nodemailer Error:", err);
            return res.render('auth/forgotpassword', {
                error: 'Failed to send OTP email. Please try again.',
                isLoggedIn: false,
                success: null
            });
        }

        res.redirect("/verify-otp?email=" + encodeURIComponent(user.email));
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong.");
    }
};
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
