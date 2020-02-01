import Auth from './Auth';
import { PostgresService } from '../services';
import { BaseConfiguration } from '../conf';

// Use of require('...) for imports here is IMPORTANT!!
import SQL = require('sql-template');
import passport = require('passport');
import passportLocal = require('passport-local');
const LocalStrategy = passportLocal.Strategy;

const configuration = new BaseConfiguration();
const auth = new Auth(configuration.InpactRdsConfig);
const dbService = new PostgresService(configuration.InpactRdsConfig);

passport.serializeUser((user: any, done: any) => {
  done(null, user.id); // serialized id to pack into the cookie
});

passport.deserializeUser(async (id: any, done: any) => {
  try {
    // Limit search to 2 (instead of one) for indexing performance
    const result = await dbService.query(SQL`
      SELECT * from users
      WHERE id = ${id}
      LIMIT 2
    `);
    const user = result.rows[0];
    console.log('user on deserilaize', user)
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/**
 * Options define how the request object/payload is built, here,
 * the FE is sending this object: IUserLoginPayload
 */
const options = {
  usernameField: 'email',
  passwordField: 'password'
};

passport.use(new LocalStrategy(options, async (email: string, password: string, done: any) => {
  // check to see if the email exists
  try {
    const result = await dbService.query(SQL`
      SELECT * from public.users
      WHERE email = ${email}
      LIMIT 2
    `)
    const user: any = result.rows[0]
    // console.warn("user-->>>> ", user)
    if (!user) return done(null, false);
    if (!auth.comparePassword(password, user.password)) return done(null, false);
    return done(null, user);  // user is now passed to passport.serialize()
  } catch (err) {
    // console.warn("passed-->>>> ", err)
    return done(err);
  }
}));

module.exports = passport;


// TODO:
// Prep to store user in DB
// https://www.youtube.com/watch?v=or1_A4sJ-oY&list=PL4cUxeGkcC9jdm7QX143aMLAqyM-jTZ2x&index=8