const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider === "local";
        }
    },
    googleId: {
        type: String,
        default: null
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    }
});
module.exports = mongoose.model("User", userSchema);