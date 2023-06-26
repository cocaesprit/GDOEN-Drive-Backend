const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const createError = require('http-errors');

const User = require('./models/User');

passport.use(new LocalStrategy(
    { usernameField: `email` },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email }).exec();

            if (!user || !await bcrypt.compare(password, user.password)) {
                // TODO: fix this shit
                done(createError(401, 'Invalid login credentials'));
            }

            done(null, user);

        } catch (error) {
            done(error);
        }
    }))

passport.serializeUser( (user, done) => {
    done(null, user._id);
})

passport.deserializeUser( async (_id, done) => {
    try {
        done(null, await User.findById(_id).exec());

    } catch (error) {
        done(error);
    }
})

module.exports = passport;
