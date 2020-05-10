import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'; // JWT: JSON Web Token, passed to front-end, validated ("signed") by backend only.
import { PostgresService } from '../services';
import { RdsConfig } from '../conf';
import SQL = require('sql-template');
import { IRequest, IUser, IMessage, IUserProfileDB } from '../types/domain';
import { QueryResult } from 'pg';

export default class Auth {
  private readonly pgService: PostgresService;

  constructor(config: RdsConfig){
    this.pgService = new PostgresService(config);
  }

  public comparePassword(userPassword: string, databasePassword: string) {
    return bcrypt.compareSync(userPassword, databasePassword);
  }

  public getHash(userPassword: string){
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(userPassword, salt);
  }

  public async createUser(req: IRequest, res: any): Promise<QueryResult | IMessage> {
    // console.log("Creating User");
    const errors = await this.handleErrors(req);
    if (errors) {
      return errors; // should be: { message: "error description" }
    }
    try {
      // const salt = bcrypt.genSaltSync();
      // const hash = bcrypt.hashSync(req.body.user.password, salt);
      const hash = this.getHash(req.body.password)
      const user = {
        email: req.body.email || undefined,
        password: hash || undefined,
        first_name: req.body.first_name || undefined,
        last_name: req.body.last_name || undefined,
        user_name: req.body.first_name || undefined,
      }
      const result = await this.pgService.query(SQL`
        INSERT INTO public.users
          $keys${Object.keys(user)}
          $values${user}
        RETURNING *
      `);
      return result;
    } catch (err) {
      let errorMsg;
      if (err.detail.includes('already exists')){
        errorMsg = "User email already exists"
      } else {
        errorMsg = `${err}`
      }
      return res.status(400).json({
        status: 400,
        statusText: errorMsg
      });
    }
  }

  private async handleErrors(req: IRequest): Promise<IMessage | void> {
    return new Promise((resolve, reject) => {
      if (req.body.email.length < 6) {
        reject({
          message: 'Email must be longer than 6 characters'
        });
      }
      else if (req.body.password.length < 1) {
        reject({
          message: `Password must be longer than ${process.env.MIN_PASS_LENGTH} characters`
        });
      } else {
        resolve();
      }
    });
  }

  public loginRequired(req: any, res: any, next: () => any) {
    // console.warn("request.body: ", req.body)
    // console.warn("request.body.user: ", req.body.user)
    if (!req.body.user) return res.status(401).json({status: 'Please log in'});
    return next();
  }

  public loginRedirect(req: any, res: any, next: () => any) {
    // A public version of the user is sent back,
    // to keep compatibility with front-end handling token vs. session handling.
    if (!req.body) console.log('no body on request:', req);
    if (req.body.user) return res.status(401).json({
      user: {
        user_name: req.body.user.user_name,
        token: generateJWT(req.body.user)
      },
      status: 'You are already logged in'});
    return next(); // move to next method in the express.route() chain
  }

  public toAuthJSON(user: IUser): IUserProfileDB {
    return {
      first_name: user.first_name,
      last_name: user.last_name,
      user_name: user.user_name,
      email: user.email,
      token: generateJWT(user),
      about_me: user.about_me,
      avatar: user.avatar
    };
  }
}
/*
  * Token Authorization
  * (not in use, only for test case)
  * */
export function generateJWT(user: IUser){
  let expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 60);

  // Payload = id, username and expiry converted to a token (signature)
  const secret: string = process.env.SECRET || '';
  return jwt.sign({
    id: user.id,  // user database id
    user_name: user.user_name,
    exp: expiryDate.getTime()/1000, // UNIX time stamp in secs for expiry.
  }, secret);
}



// module.exports = {
//   comparePass,
//   createUser,
//   loginRequired,
//   adminRequired,
//   loginRedirect,
//   generateJWT, // token approach
//   toAuthJSON// token approach
// };