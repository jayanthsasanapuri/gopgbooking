const mongoose = require("mongoose");
const wishlistSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true

    },

    pgId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin",
        required:true
    }
},{
    timestamps:true
});
module.exports = mongoose.model("Wishlist",wishlistSchema);