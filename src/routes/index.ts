
import * as express from 'express';
const appApi = express.Router()

// (1) Register all api endpoints
appApi.use('/api', require('./userSession')); // default endpoint
// router.use('/api/contact', require('./transporter')); // mailgun endpoint

// TODO: Could likely delete this part!!!
// (2) Middleware function for our API router to handle validation errors from Mongoose
appApi.use(function(err: any, req: any, res: any, next: any){ // Router() treats functions with 4 parameters as error handlers.
  if (err.name === 'ValidationError'){
    console.warn("Error on ./api/index.js intended for old Mongoose errors");
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors: any, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }
  return next(err);
});

module.exports = appApi;