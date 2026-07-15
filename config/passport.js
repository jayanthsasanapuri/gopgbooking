const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/UserModel");
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({
                    email: profile.emails[0].value
                });
                if (!user) {
                    const names = profile.displayName.split(" ");
                    user = await User.create({
                    firstName: names[0],
                    lastName: names.slice(1).join(" "),
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    provider: "google"
                   });
                }
                else if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();

                }
                done(null, user);
            } catch (err) {
                done(err, null);

            }
        }
    )
);
passport.serializeUser((user, done) => {
    done(null, user.id);

});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);

    }
});
module.exports = passport;