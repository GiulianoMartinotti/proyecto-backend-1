import passport from 'passport';
import local from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from '../models/user.js';
import { createHash, isValidPassword } from '../utils/bcrypt.js';

const LocalStrategy = local.Strategy;

const initializePassport = () => {

    passport.use('register', new LocalStrategy(
        { usernameField: 'email', passReqToCallback: true },
        async (req, email, password, done) => {
            const { first_name, last_name, age } = req.body;

            try {
                const userExists = await User.findOne({ email });
                if (userExists) return done(null, false);

                const newUser = new User({
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                });

                const savedUser = await newUser.save();
                return done(null, savedUser);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) return done(null, false);
                if (!isValidPassword(user, password)) return done(null, false);

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));


    // Estrategia JWT
    passport.use('jwt', new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id);
                if (!user) return done(null, false);
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    ));


    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export default initializePassport;
