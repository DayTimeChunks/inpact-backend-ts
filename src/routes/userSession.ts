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
      return handleResponse(res, 200, 'success', auth.toAuthJSON(user));
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
  const email = req.body.user.email;
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

    // Updates user's profile except avatar (see below for avatar)
    const new_email = req.body.user.new_email ? req.body.user.new_email: email;
    const user_name = req.body.user.user_name || user.user_name;
    const first_name = req.body.user.first_name  || user.first_name;
    const last_name = req.body.user.last_name || user.last_name;
    const country = req.body.user.country || user.country;
    const about_me = req.body.user.about_me || user.about_me;
    const address = req.body.user.address || user.address;
    const education = req.body.user.education || user.education;
    const experiences = req.body.user.experiences || user.experiences;
    const interests = req.body.user.interests || user.interests;

    // Pasword update
    const unencryptedPassword = req.body.user.password || undefined;
    let newHash;
    if (unencryptedPassword) {
      newHash = auth.getHash(unencryptedPassword);
    }
    const password = newHash ? newHash: user.password;

    const updatedUser = await dbService.query(SQL`
      UPDATE users
      SET email=${new_email}, first_name=${first_name}, last_name=${last_name}, user_name=${user_name},
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