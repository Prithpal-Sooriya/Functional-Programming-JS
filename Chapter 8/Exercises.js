const R = require('ramda');
const M = require('monet');


//NOTE: when dealing with functors, always map them to change data inside!!

// Use 'add' and 'map' to make a function that increments a value inside a functor
// incrF :: Functor f => f Int -> f Int
// const incrF = R.curry(R.add(1), R.map)
const incrF = R.map(R.add(1));
console.log(incrF([1]));

//--------------------------------

// Use safeProp and head to find first initial of the user.
/**
 * RamdaJS = library containing utilities/functions for existing datatypes
 * Folktale = library containing FP datatypes (Containers, Maybe, Either, IO, Task, etc)
 *  --> painful, because no IO class
 * Monet = seems to contain FP funtors/monoids
 */
const user = {id: 2, name:'Albert', active: true};
const safeProp = R.curry((p, obj) => R.compose(M.Maybe.of, R.prop(p))(obj));
const initial = R.compose(R.map(R.head), safeProp('name'));
console.log(initial(user))

//--------------------------------

// given following helper functions:

// showWelcome :: User -> String
const showWelcome = R.compose(R.concat('Welcome '), R.prop('name'));

// checkActive :: User -> Either String User
// folktale either.right/left = result.ok/error
const checkActive = user => {
  return user.active
    ? M.Either.Right(user)
    : M.Either.left('Your account is not active');
};

// write a function that uses 'checkActive' and 'showWelcome' to grant access or return the error

// eitherWelcome :: User -> Either String String
const eitherWelcome = R.compose(R.map(showWelcome), checkActive);
console.log(eitherWelcome(user));

//--------------------------------
console.log('-----------------------------------')
//given following functions

// validateUser :: (User -> Either String ()) -> User -> Either String User
const validateUser = R.curry((validate, user) => validate(user).map(_ => user));

// save :: User -> IO User
// Folktale does not have IO, but can use Task
const save = user => M.IO(() => ({...user, saved:true}));

//write a function 'validateName'
// --> checks if a user has a name > 3 characters, or return error message.
//'either', 'showWelcome', 'save' to write a 'register' function to signup and welcome a user when validation is ok
// --> either arguments must return same type!!

// validateName :: User -> Either String()
const validateName = ({name}) => {
  return name.length > 3
    ? M.Either.Right(name)
    : M.Either.left("name is too short (more than 3 characters)")
}

//logging tool
const trace = msg => R.tap(x => console.log(msg, x));

//either function (basically an if else)
const either = R.curry((f, g, e) => {
  if(e.isLeft()) {
    return f(e.left());
  }
  return g(e.right());
});

const saveAndWelcome = R.compose(R.map(showWelcome), save);

// register :: User -> IO String
const register = R.compose(
  either(M.IO.of, saveAndWelcome),
  validateUser(validateName)
);
console.log(register({name: 'Prithpal Sooriya'}).run());