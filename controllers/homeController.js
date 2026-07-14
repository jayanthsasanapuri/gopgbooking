const Admin = require("../models/AdminModel");
exports.getHome = async (req, res) => {
    try {
        const locations = await Admin.distinct("city");
        res.render("home", {
            isLoggedIn: false,
            locations
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error loading home page.");
    }
};