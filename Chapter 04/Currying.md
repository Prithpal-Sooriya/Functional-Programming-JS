# Curring

## What is currying

**Curring = call functions with few args, returns functions with remaining args**

**Curring Allows you to preload a function with some arguments --> returns a function that will remember all those arguments**

Difference between Currying and partial application:
- currying = function that takes function with multiple params as input and returns functions with exactly **1** parameter.
- partial application = takes a function with multiple params and returns a function with fewer params.

Example

```js
const add = x => y => x + y; //add will return function that will require y
const increment = add(1);
const addTen = add(10);

increment(2); // 3
addTen(2); // 12
```

returned functions of `add()` will remember first argument via closure.

use special helper function called `curry()` to make defining and calling these functions easier --> no need to create const variables that are only called once.

example 1:
```js
const match = curry((what, s) => s.match(what));
const replace = curry((what, replacement, s) => s.replace(what, replacement));
const filter = curry((f, xs) => xs.filter(f));
const map = curry((f, xs) => xs.map(f));
```
- rule of thumb = last parameter/arg is data operating on (so above is the string `s`)

example 2:
```js
match(/r/g, 'hello world'); // [ 'r' ]

const hasLetterR = match(/r/g); // x => x.match(/r/g)
hasLetterR('hello world'); // [ 'r' ]
hasLetterR('just j and s and t etc'); // null

filter(hasLetterR, ['rock and roll', 'smooth jazz']); // ['rock and roll']

const removeStringsWithoutRs = filter(hasLetterR); // xs => xs.filter(x => x.match(/r/g)) //curry of above
removeStringsWithoutRs(['rock and roll', 'smooth jazz', 'drum circle']); // ['rock and roll', 'drum circle']

const noVowels = replace(/[aeiou]/ig); // (r,x) => x.replace(/[aeiou]/ig, r)
const censored = noVowels('*'); // x => x.replace(/[aeiou]/ig, '*')
censored('Chocolate Rain'); // 'Ch*c*l*t* R**n'
```

## Curring functions to make mappable functions

transform any function that works on single elements into a function that works on arrays simply by wrapping it with map.

```js
const getChildren = x => x.childNodes;
const allTheChildren = map(getChildren); //example of "partial application" = giving function fewer args than it expects = can remove boiler plate code.

const allTheChildren = elements => map(elements, getChildren); //map that isnt partial application, can use other higher order functions (filter, sort, ..., "function that takes or returns a function)
```

- pure functions -> 1 input to 1 output.
    - curring = each single argument returns new function expecting new args
        - f(x, y); f(x) -> f(y) (function expecting new args)

## summary
- Curring makes functional programming less verbose and tedious.
- makes new, useful functions on the fly when passing few arguments (partial application).
- retain mathematical function definition whilst using multiple arguments (multiple inputs).