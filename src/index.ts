// config should be included first thing
import 'dotenv/config';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors'; // allows for restricting querying from specific url's
const passport = require('passport'); // import passport to initialize & start passport.session().
const cookieSession = require('cookie-session'); //encrypting keys
// require('./auth/passport'); // Used for signing tokens, (i.e. checking user is Good), switch if not using cookies (ie. session auth).

const routes = require('./routes');
import { BaseConfiguration } from './conf';

// Express app setup
const app = express();
app.use(cors()); // default options
app.use(bodyParser.json({limit: '100mb'})); // <- limit from PP.Backend
// app.use(httpContext.middleware); // must come after bodyParser

/*
* Cookie Session parameters
* */
const baseConfiguration = new BaseConfiguration();
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  keys: [baseConfiguration.cookieKey]
})); // Send cookie to browser

/*
* Passport initialization
* // https://www.youtube.com/watch?v=5dQsR9Kcnzc&list=PL4cUxeGkcC9jdm7QX143aMLAqyM-jTZ2x&index=16
* */
app.use(passport.initialize());
app.use(passport.session());

// TODO:
// Test auth response:
// https://www.youtube.com/watch?v=e-nZAsVw7Rw&list=PL4cUxeGkcC9jdm7QX143aMLAqyM-jTZ2x&index=17

/*
* DB Connection
* - determine environment: development | production
* -
* */
const isProduction = process.env.NODE_ENV === 'production';
console.log("Environment ", process.env.NODE_ENV); // undefined..

/*
* Use all pre-defined routes // app.use(require('./routes'));
* */
app.use(routes);

// Basic error handler for undefined routes
// https://expressjs.com/en/guide/writing-middleware.html
// Router() treats functions with 4 parameters as error handlers.
app.use(function(req, res, next) {
  const err = new Error('Endpoint not yet defined');
  // err.status = 404;
  next(err);
});

/*
* Error handlers (production and development are different)
* */
if (!isProduction) {
  app.use(function(err: any, req: any, res: any, next: any) {
    console.log(err.stack);

    res.status(err.status || 500); // 500 is InternalServer Error (default)

    res.json({'errors': {
        message: err.message,
        error: err,
        req: Object.getOwnPropertyNames(req),
        body: req.body
      }});
  });
} else {
  // no stacktraces leaked to user
  app.use(function(err: any, req: any, res: any, next: any) {
    res.status(err.status || 500);
    res.json({'errors': {
        message: err.message,
        error: {}
      }});
  });
}

// finally, let's start our server...
const port = process.env.PORT || 5000;
if(!module.parent){
  app.listen(port, function() {
    console.log(`Listening on port: ${port}`);
  });
  
}

export default app;
