# Pure Error Handling (Either / Or)

`Throw` and `Catch` are not pure functions when error handling
- instead of returning output value, throw an error
  - choose to handle error/fix error, or throw the error even futher.

`Either` function can handle errors in its place.

**`Either` great for validation, stop some errors (like missing files and broken sockets), and give more feedback then `Maybe`**


```js
class Either {
  static of(x) {
    return new Right(x);
  }

  constructor(x) {
    this.$value = x;
  }
}

class Left extends Either {
  map(f) {
    return this;
  }

  inspect() {
    returns `Left(${inspect(this.$value)})`;
  }
}

class Right extends Either {
  map(f) {
    return Either.of(f(this.$value));
  }

  inspect() {
    return `Right(${inspect(this.$value)})`;
  }
}
```
- `Left` and `Right` are subclasses of abstract type `Either`
  - above `Either` and rest are not fully implemented (just to show the core functionality of these functions).

```js
const left = x => new Left(x);
Either.of('rain').map(str => `b${str}`);
// output: Right('brain'), continues map

left('rain').map(str => `It's gonna ${str}, better bring your umbrella!`);
// output: Left('rain'), does not continue map

Either.of({host: 'localhost', port:80}).map(prop('host'));
// output: Right('localhost')

left('rolls eyes').map(prop('host'));
// output: Left('rolls eyes...')
```

- `Left(...)` will ignore requests to map over it.
- `Right(...)` will work like a container (identity)

If there is a function that may fail, can use `Maybe/Nothing` to signal failure (branch off), of use Either to be more explicit.

```js 
const moment = require('moment');

// getAge :: Date(moment) -> User -> Either(String, Number)
const getAge = curry((now, user) => {
  const birthDate = moment(user.birthDate, 'YYYY-MM-DD');

  return birthDate.isValid()
    ? Either.of(now.diff(birthDate, years))
    : left('Birth date could not be parsed');
});

// current year is 2018
getAge(moment(), {brithDate:'2005-12-12'});
// output: Right(13)

getAge(moment(), {birthDate:'July 4, 2001'});
// output: Left('Birth date could not be parsed')
```
- just like `Maybe/Nothing`, will branch off code if there is an error, but now will give more detailed explination on errors.

- code above returns `Either(String, Number)`, left param is error, right param is correct output.

```js
// fortune :: Number -> String
const fortune = compose(concat('If you survive you will be '), toString, add(1));

// zoltar :: User -> Either(String, _) //second param output means ignore
const zoltar = compose(map(console.log), map(fortune), getAge(moment()));

zoltar({birthDate: '2005-12-12'});
// output: 'If you survive, you will be 14'
// output: Right(undefined)

zoltar({birthDate: 'Hello World'});
//output: Left('Birth date could not be parsed')
```
- if birthdate is valid -> output fortune string with console.log.
- if birthdate is invalid -> handle errors with Left, with a error message (inside Left container.)

- logically branching control flow depending of validaty of birthdate, but more readable compared to curly brackets `{}`

- use `_` in right branch type signature --> indicates it is a valeu that should be ignored
   - thats why will get a `Right('undefined')` as well as console.log

**some browsers might need to: `console.log.bind(console)` to use first class**

- `fortune` function is ignorant of any functors milling about.
  - At same time of calling, a function can be surrounded with a `map`
    - transforms it from non-functory function to a functory function. **Called 'Lifting'**

Functions work better with normal datatypes rather than container types, then 'lift' right container when need be.
- more simpler, more reusable function.

Either acts as a container for errors and capture logical disjunction (`||`) in a type.
  - also coproduct in category theory

Either will take 2 functions instead of 1 function and static value (that Maybe takes.)

```js
// either :: (a -> c) -> (b ->c) -> Either a b -> c
// what above means:
//   (a -> c) = function that takes a and gives c (called f below)
//   (b -> c) = function that takes b and gives c (called g below)
// Either a b -> c (either a or b will give a c)
const either = curry((f, g, e) => {
  let result;

  switch(e.constructor) {
    case Left:
      result = f(e.$value);
      break;
    
    case Right:
      result = g(e.$value);
      break;
    
    //no default
  }

  return result;

});

// zoltar :: User -> _
const zoltar = compose(console.log, either(id, fortune), getAge(moment()));

zoltar({birthDate: '2005-12-12'});
// console.log: 'If you survive, you will be 14'
// output: undefined

zoltar({birthDate: 'Hello World'});
// console.log: 'Birth date could not be parsed'
// output: undefined
```
- `id` function = returns back the value of left to pass the error message to console.log
