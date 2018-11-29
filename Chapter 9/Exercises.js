const R = require('ramda');
const M = require('monet');

/* 1. */

//consider user object as follows
const user = {
  id: 1,
  name: 'Albert',
  address: {
    street: {
      number: 22,
      name: 'Walnut St'
    }
  }
};

// use safeProp and map/join or chain to get the street name when given a user
// safeProp :: Prop -> Maybe Object
const safeProp = R.curry((p, obj) => R.compose(M.Maybe.of, R.prop(p))(obj));

// getStreetName :: User -> Maybe String
const getStreetName = R.compose(
  R.chain(safeProp('name')),
  R.chain(safeProp('street')),
  safeProp('address')
);
// R.map(getStreetName(user), str => console.log(str));
console.log("Exercise 1: ", getStreetName(user).orJust());

/* 2. */

// consider have following functions
// getFile :: () -> IO String
const getFile = () => M.IO.of('home/Prithpal/Functional-Programing-JS/Chapter_9.md');

// pureLog :: String -> IO ()
const pureLog = str => new M.IO(() => console.log("Exercise 2: ", str));

// use getFile to get filePath, remove the directory and keep only basename
// then purely log it.
// --> hint: you may want to use split() and last() to obtain basename from path

// trace :: a -> a
const trace = msg => R.tap(x => console.log(msg, x));

// logFilename :: IO ()
const logFilename = R.compose(
  R.chain(pureLog), //output: IO x
  R.map(R.compose(R.last, R.split('/'))), //output: IO (IO x)
  getFile //output: IO x
);
logFilename().run();

/* 3. */

// consider helpers with following signatures:

// validateEmail :: Email -> Either String Email
const validateEmail = () => {};

// addToMailingList :: Email -> IO([Email])
const addToMailingList = () => {};

// emailBlast :: [Email] -> IO ()
const emailBlast = () => {};

//use validateEmail, addToMailingList, emailBlast
// --> create function that adds new email to mailing list if valid, then notify whole list
//not given code, as mostly enterprise code is blackbox

// joinMailingList :: Email -> Either String (IO ())
const joinMailingList = R.compose(
  R.map(R.compose(R.chain(emailBlast), addToMailingList)),
  validateEmail
);