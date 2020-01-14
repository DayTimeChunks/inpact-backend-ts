import Auth from './Auth';
import { PostgresService } from '../services';
import { BaseConfiguration } from '../conf';

// Use of require('...) for imports here is IMPORTANT!!
import SQL = require('sql-template');
import passport = require('passport');
import passportLocal = require('passport-local'); 
const LocalStrategy = passportLocal.Strategy;

const auth = new Auth();
const configuration = new BaseConfiguration();
const dbService = new PostgresService(configuration.InpactRdsConfig);

// interface IUser {
//   id: number;
//   email: string;
//   password: string;
// }

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

const options = {
  usernameField: 'user[email]',
  passwordField: 'user[password]'
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
    if (!user) return done(null, false);
    if (!auth.comparePassword(password, user.password)) return done(null, false);
    return done(null, user);  // user is now passed to passport.serialize()
  } catch (err) {
    console.warn('Error on LocalStrategy');
    return done(err);
  }
}));

module.exports = passport;


// TODO:
// Prep to store user in DB
// https://www.youtube.com/watch?v=or1_A4sJ-oY&list=PL4cUxeGkcC9jdm7QX143aMLAqyM-jTZ2x&index=8