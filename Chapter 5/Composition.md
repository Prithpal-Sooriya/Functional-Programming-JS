# composition

## what is composition

```js
const compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];
```

Compose = combine 2/any functions together.

`const compose2 = (f, g) => x => f(g(x));` --> perform g(x) first then f(of the result of g)
- values/results are bring piped to one another.
- RamdaJS makes this cleaner by removing '()' and makes them params.

```js
const toUpperCase = x => x.toUpperCase();
const exclaim = x => `${x}!`;
const shout = compose(exclaim, toUpperCase); //takes function above.
//const shout = x => exclaim(toUpperCase(x)); //this is nesting function calls, not as clean!!

shout('send in the clowns'); // "SEND IN THE CLOWNS!"
```

**compositon of 2 functions forms a new function.**
- better than nesting function calls.

```js
const head = x => x[0];
const reverse = reduce((acc, x) => [x].concat(acc), []);
const last = compose(head, reverse); //read right to left (so reverse then head.)

last(['jumpkick', 'roundhouse', 'uppercut']); // 'uppercut'

// associativity
compose(f, compose(g, h)) === compose(compose(f, g), h);
```

**Composition is associative, so can be nested in any order (as long as params are the same order**
- or better compose function can take any number of functions.
- can also make combined functions to decrease parameters
```js
const last = compose(head, reverse);
const loudLastUpper = compose(exclaim, toUpperCase, last);
```

This allows Refractoring and extraction of functions without dealing with OOP object states!

## Point free
**Where functions never mention the data they are operating on**

```js
// not pointfree because we mention the data: word
const snakeCase = word => word.toLowerCase().replace(/\s+/ig, '_');

// pointfree
//toLowerCase is in Appendix C, production ready are ramda, lodash, folktale...
const snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);
```
- partially applies replace function, and feed toLowerCase function to it.
    - currying = take data, operate on it, pass it on
    - point free = dont need to pass in data (generic)/dont need `word` var.
    - compose = combine the functions together.

Another example
```js
// not pointfree because we mention the data: name
const initials = name => name.split(' ').map(compose(toUpperCase, head)).join('. ');

// pointfree
const initials = compose(join('. '), map(compose(toUpperCase, head)), split(' '));

initials('hunter stockton thompson'); // 'H. S. T'
```
pointfree:
- removes var/names and keeps code concise and generic.
- sometimes can be bad = hard to read code!!

**can do point free style with compose = removes names**

## Debugging

Mistake 1 = composing a function of 2 args (e.g. `map`) without partially applying it.

```js
// wrong - we end up giving angry an array and we partially applied map with who knows what.
const latin = compose(map, angry, reverse);

latin(['frog', 'eyes']); // error

// right - each function expects 1 argument.
const latin = compose(map(angry), reverse);

latin(['frog', 'eyes']); // ['EYES!', 'FROG!'])
```

Find bugs with composition with a trace function (console logging)
- Languages like Haskell and PureScript

## Category Theory

Branch of abstract mathematics that formalize concepts from several different branches
- e.g. set theory, type theory, group theory, logic, more.
- deals with objects, morphisms, and transformations (simmilar to programming)

In programming terms:
- collection of objects = data types (String, Boolean, Number, Object). Datatype as sets of all possible values (bool = [true, false], String = [a, ..., z]).
- collection of morphisms = pure functions.
- composition on morphisms = compose function. Allows you to not store intermediate results of intermediate functions.
    - PIPING is a compose, but can be read from left to right.

A distinguished morphism called identity = function called `id`. It takes input and returns it (does nothing to data!)
- `const id = x => x;`
    - Use as a function that can stand in for a value! Function acting like data.

Id must work well with compose. Below, it holds every unary (one argument) function f
```js
// identity
compose(id, f) === compose(f, id) === f;
// true
```

function that acts as a stand in for a given value

**quite useful when writing pointfree code.""

## summary
- composition connects functions together (passed right to left)
    - pipes pass functions right to left.

- using pure functions and compose, we can disregard the data passed in (data is generic) = pointfree style!
    - point free = no use of variable, so data input can be generic.

- composition is an important design principle --> keeps apps simple and reasonable
    - category theory is important for app architecture, modelling side effects, ensuring correctness.

- debugging functions with trace() function. (no side effects, just console logs.)



