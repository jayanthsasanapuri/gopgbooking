const express = require("express");
const wishlistController = require("../controllers/wishlistController");
const router = express.Router();
router.get("/wishlist",wishlistController.getWishlist);
router.post("/wishlist/add/:pgId",wishlistController.addWishlist);
router.post("/wishlist/remove/:pgId",wishlistController.removeWishlist);
module.exports = router;