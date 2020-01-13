import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'; // JWT: JSON Web Token, passed to front-end, validated ("signed") by backend only.


interface IRequest {
  body: {
    user: any;
  };
}
// interface IResult {
//   status: (arg0: number) => {
//     (): any;
//     new(): any;
//     json: {
//       (arg0: { status: string; }): any;
//       new(): any;
//     };
//   };
// }

export default class Auth {

  constructor(){
  }

  public comparePassword(userPassword: string, databasePassword: string) {
    return bcrypt.compareSync(userPassword, databasePassword);
  }


  public static loginRequired(req: IRequest, res: any, next: () => any) {
    console.warn("request.body: ", req.body)
    console.warn("request.body: ", req.body.user)
    if (!req.body.user) return res.status(401).json({status: 'Please log in'});
    return next();
  }

  public loginRedirect(req: IRequest, res: any, next: () => any) {
    // A public version of the user is sent back,
    // to keep compatibility with front-end handling token vs. session handling.
    console.log('loginRedirect request body', req.body)
    if (!req.body) console.log('no body on request:', req)
    if (req.body.user) return res.status(401).json({
      user: {
        username: req.body.user.username,
        token: this.generateJWT(req.body.user)
      },
      status: 'You are already logged in'});
    return next(); // move to next method in the express.route() chain
  }
  /*
  * Token Authorization
  * (not in use, only for test case)
  * */
  public generateJWT(user: any){
  let expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 60);
  console.log("expiry date:" , expiryDate.getTime()/100)
  
  // Payload = id, username and expiry converted to a token (signature)
  const secret: string = process.env.SECRET || '';
  return jwt.sign({
    id: user.id,  // user database id
    username: user.username,
    exp: expiryDate.getTime()/1000, // UNIX time stamp in secs for expiry.
  }, secret);
  }

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