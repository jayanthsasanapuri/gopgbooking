const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login"
    }),
    (req, res) => {
      console.log("=========== CALLBACK ===========");
        console.log("req.user =", req.user);

        req.session.user = {
            userId: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
        };
 console.log("Session User =", req.session.user);
        req.session.save((err) => {

            if (err) {
                console.log(err);
                return res.redirect("/login");
            }

            res.redirect("/card");

        });

    }
);

module.exports = router;