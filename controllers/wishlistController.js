const Wishlist = require("../models/wishlistmodel");
exports.addWishlist = async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    try {
        const userId = req.session.user.userId;
        const pgId = req.params.pgId;
        const existingWishlist = await Wishlist.findOne({
            userId,
            pgId
        });
        if (existingWishlist) {
            return res.redirect("/card");
        }
        const wishlist = new Wishlist({
            userId,
            pgId
        });
        await wishlist.save();
        res.redirect("/card");

    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding wishlist.");
    }
};
exports.removeWishlist = async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    try {
        await Wishlist.findOneAndDelete({
            userId: req.session.user.userId,
            pgId: req.params.pgId

        });
        res.redirect("/card");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Error removing wishlist.");
    }
};
exports.getWishlist = async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    try {
        const wishlists = await Wishlist.find({
            userId: req.session.user.userId
        })
        .populate("pgId")
        .sort({ createdAt: -1 });
        res.render("wishlist", {
            wishlists,
            user: req.session.user,
            isLoggedIn: true
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Error loading wishlist.");
    }
};