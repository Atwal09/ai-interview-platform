'use strict';

const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');
const logger = require('./logger');

// JWT Strategy
passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  algorithms: ['HS256'],
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (!user) return done(null, false, { message: 'User not found' });
    if (!user.isActive) return done(null, false, { message: 'Account deactivated' });
    return done(null, user);
  } catch (err) {
    logger.error('JWT strategy error', { error: err.message });
    return done(err, false);
  }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    scope: ['profile', 'email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(null, false, { message: 'No email from Google' });

      let user = await User.findByEmail(email);

      if (!user) {
        user = await User.create({
          name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`,
          email,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || null,
          isVerified: true,
          role: 'user',
        });
        logger.info('New Google OAuth user', { userId: user._id, email });
      } else if (!user.googleId) {
        user = await User.findByIdAndUpdate(user._id, {
          googleId: profile.id,
          isVerified: true,
          avatar: user.avatar || profile.photos?.[0]?.value || null,
        }, { new: true });
      }

      await User.updateLastLogin(user._id);
      return done(null, user);
    } catch (err) {
      logger.error('Google strategy error', { error: err.message });
      return done(err, false);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); }
  catch (err) { done(err, null); }
});

module.exports = passport;
