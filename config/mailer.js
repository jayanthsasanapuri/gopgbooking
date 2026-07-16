const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for port 465, false for port 587
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // App Password, not your regular Gmail password
    }
});

// Optional: verify connection on startup so you catch config issues early
transporter.verify((error, success) => {
    if (error) {
        console.error("Mailer connection error:", error);
    } else {
        console.log("Mailer is ready to send emails");
    }
});

module.exports = transporter;