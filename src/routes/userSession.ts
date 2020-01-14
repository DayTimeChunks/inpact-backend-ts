import Auth, { generateJWT } from '../auth/Auth';
import * as express from 'express';
import { BaseConfiguration } from '../conf';
import { PostgresService } from '../services';
import SQL = require('sql-template');
const passport = require('../auth/local');
const appApi = express.Router()

const auth = new Auth();
const configuration = new BaseConfiguration();
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

appApi.post('/users/login', auth.loginRedirect, (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {  // see: ./auth/local.js @LocalStrategy
    if (err) { handleResponse(res, 500, 'error'); }
    if (!user) { handleResponse(res, 404, 'User not found or password was incorrect'); }
    if (user) {
      req.logIn(user, function (err) {
        if (err) { handleResponse(res, 500, 'error'); }
        // A public version of the user is sent back,
        // to keep compatibility with front-end handling token vs. session handling.
        handleResponse(res, 200, 'success', {
            username: user.username,
            email: user.email,
            token: generateJWT(user)
          });
      });
    }
  })(req, res, next);
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