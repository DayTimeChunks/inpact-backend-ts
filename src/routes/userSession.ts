import Auth, { generateJWT } from '../auth/Auth';
import * as express from 'express';
import { BaseConfiguration } from '../conf';
import { PostgresService } from '../services';
import SQL = require('sql-template');
const passport = require('../auth/local');
const appApi = express.Router()

const configuration = new BaseConfiguration();
const auth = new Auth(configuration.InpactRdsConfig);
const dbService = new PostgresService(configuration.InpactRdsConfig);

appApi.get('/test', async (req, res, next)  => {
  // Returns user's profile (search by email)
  try {
    const result = await dbService.query(SQL`
    SELECT * from users
    WHERE email = 'pablo@admin.com';
    `)
    const user = result.rows[0]
    if (!user) {
      console.log("select email does not exist");
      return res.send("user does not exist")
    }
    // console.log("row on /test result", user)
    return res.json(user);
  } catch (err) {
    console.warn("Error on query for User query: ", err)
    return res.status(400).json({
        err: err,
        status: err.message
    });
  }
})

appApi.post('/register', auth.loginRedirect, async (req, res, next)  => {
  await auth.createUser(req, res);
  try {
    passport.authenticate('local', (err: any, user: any, info: any) => { // see: ./auth/local.js @LocalStrategy
      if (user) {
        req.logIn(user, function (err) {
          if (err) { handleResponse(res, 500, err); }
            // A public version of the user is sent back,
            // to keep compatibility with front-end handling token vs. session handling.
          handleResponse(res, 200, 'success', {
              user_name: user.user_name,
              email: user.email,
              token: generateJWT(user)
          });
        });
      }
    })(req, res, next);
  } catch (err) {
    console.warn(err);
    handleResponse(res, 500, 'error');
  }
});

appApi.post('/users/login', auth.loginRedirect, (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {  // see: ./auth/local.js @LocalStrategy
    // console.warn("user from local", user)
    if (err) { handleResponse(res, 500, 'error'); }
    if (!user) { handleResponse(res, 404, 'User not found or password was incorrect'); }
    if (user) {
      req.logIn(user, function (err) {
        if (err) { handleResponse(res, 500, 'error'); }
        // A public version of the user is sent back,
        // to keep compatibility with front-end handling token vs. session handling.
        handleResponse(res, 200, 'success', {
            user_name: user.user_name,
            email: user.email,
            token: generateJWT(user)
          });
      });
    }
  })(req, res, next);
});

appApi.get('/logout', (req, res, next) => {
  req.logout();
  handleResponse(res, 200, 'success');
});

appApi.post('/get-profile', auth.loginRequired, async (req, res, next)  => {
  // Returns user's profile (search by email)
  const email = req.body.user.email;
  try {
    const result = await dbService.query(SQL`
      SELECT * from users
      WHERE email = ${email};
      `)
    const user = result.rows[0]
    // console.log('user', user)
    if (user) {
      return handleResponse(res, 200, 'success', user);
    }
    return res.status(404).send("User does not exist")
  } catch (err) {
    console.warn("Error on /get-profile for user: ", err)
    return res.status(500).json({
      error: `${err}`
    })
  }
});

appApi.post('/update-profile', auth.loginRequired, async (req, res, next)  => {
  /**
   * user's properties arrive as camel-case, convert to snake-case before updating DB!
   */
  let email = req.body.user.email;
  try {
    const result = await dbService.query(SQL`
      SELECT * from users
      WHERE email = ${email};
      `)
    const user = result.rows[0]
    // console.log('user', user)
    if (!user) {
      return res.send("User does not exist")
    }

    let { user_name, first_name, last_name,
      country, about_me, address, education, experiences, interests } = user

    // Updates user's profile except avatar (see below for avatar)
    email = req.body.user.newEmail ? req.body.user.newEmail: email;
    user_name = req.body.user.userName || user_name;
    first_name = req.body.user.firstName  || first_name;
    last_name = req.body.user.lastName || last_name;
    country = req.body.user.country || country;
    about_me = req.body.user.aboutMe || about_me;
    address = req.body.user.address || address;
    education = req.body.user.education || education;
    experiences = req.body.user.experiences || experiences;
    interests = req.body.user.interests || interests;

    // Pasword update
    const unencryptedPassword = req.body.user.password || undefined;
    let newHash;
    if (unencryptedPassword) {
      newHash = auth.getHash(unencryptedPassword);
    }
    const password = newHash ? newHash: user.password;

    const updatedUser = await dbService.query(SQL`
      UPDATE public.users
      SET email=${email}, first_name=${first_name}, last_name=${last_name}, user_name=${user_name},
        password=${password}, address=${address}, country=${country}, about_me=${about_me}, education=${education}, 
        experiences=${experiences}, interests=${interests}
      WHERE email=${email}
      RETURNING *;
    `)
    return handleResponse(res, 200, "success", updatedUser.rows[0])

  } catch (err) {
    console.warn("Error on /update-profile for user: ", err)
    return res.status(500).json({
      error: `${err}`
    })
  }
});

function handleResponse(res: any, code: any, statusMsg: any, user: any = {}) {
  /* Returns a user if user, else {status: message}
  * */
  if (user) {
    user.statusText = statusMsg;
    return res.status(code).json(user);
  }
  res.status(code).json({
    status: code,
    statusText: statusMsg});
}


module.exports = appApi;
// export default appApi;