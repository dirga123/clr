import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import debug from 'debug';

import Redis from './lib/redis';
import errorString from './errorString.js';

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.

/*
co(function*() {
  const user = yield User.byEmail(email)
  ...
  return user
}).then(res => done(null, res), done)
*/

passport.use(new LocalStrategy(
  async (username, password, done) => {
    debug('auth')(`LocalStrategy (${username}, ${password})`);

    try {
      const redis = new Redis();
      await redis.login();
      const user = await redis.getLoginUser(username, password);
      await redis.logout();

      if (user === undefined) {
        await done(null, 'Wrong username or password');
      } else {
        await done(null, user);
      }
    } catch (e) {
      debug('auth')(`LocalStrategy, catched error (${errorString(e)})`);
      await done(null, errorString(e));
    }

    debug('auth')(`LocalStrategy (${username}, ${password})`);
  })
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser((user, done) => {
  debug('auth')(`serializeUser (${user.id}, ${user.name})`);

  done(null, user);

  debug('auth')(`serializeUser finished (${user.id}:${user.name})`);
});

// passport.deserializeUser((user/*id*/, done) => {
passport.deserializeUser((user, done) => {
  debug('auth')(`deserializeUser(${user.id},${user.name})`);

  done(null, user);

  debug('auth')(`deserializeUser finished (${user.id},${user.name})`);
  /*
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
  */
});

export default passport;
