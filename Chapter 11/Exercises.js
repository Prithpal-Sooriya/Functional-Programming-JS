const R = require('ramda');
const M = require('monet');

/* Task 1 */
// write a natural transformation funtion that converts `Either b a` to `Maybe a`

// either :: (a -> c) -> (b -> c) -> Either a b -> c
const either = R.curry((f, g, e) => {
  if(e.isLeft()) {
    return f(e.left());
  }
  return g(e.right());
});

// eitherToMaybe :: Either b a -> Maybe a
// '_' --> means any param (waiting for input)
const eitherToMaybe = either(_ => M.Maybe.Nothing(), M.Maybe.of);
console.log(eitherToMaybe(M.Either.of('a')));
console.log(eitherToMaybe(M.Left('b')));

/* Task 2 */
// given some code
// eitherToTask :: Either a b -> Task a b
const eitherToTask = either(Task.rejected, Task.of); //monet does not support Task type

// using eitherToTask, simplify `findNameById` to remove the nested Either

//old
// findNameById :: Number -> Task Error (Either Error User)
const findNameById1 = compose(map(map(prop('name'))), findUserById);

//new
// findNameById :: Numebr -> Task Error User
const findNameById2 = compose(
  map(prop('name')),
  chain(eitherToTask), // change Either to Task and chain it (remove Task??)
  findUserById // returns Either Error User
); 
//feel like this correct code above it not correct... thought need to `map(chain(eitherToTask))`

/* Task 3 */
//given to type signatures

// split :: String -> String -> [String]
const split = curry((sep, str) => str.split(sep));

// intercalate :: String -> [String] -> String
const intercalate = curry((str, xs) => xs.join(str));

// write isomorphisms between String and [char]

// strToList :: String -> [char]
const strToList = split(""); //auto curried so dont need to explicitly state this is a function!

// listToStr :: [char] -> String
const listToStr = intercalate("");