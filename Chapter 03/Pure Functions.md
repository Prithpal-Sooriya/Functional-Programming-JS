# Pure functions

## examples of pure vs impure
**pure = immutable and same output for every input**
- try to contain variable inside scope.

examples of pure vs impure functions:
- `slice` = pure = same output per input every time, guaranteed.
- `splice` = impure = different output with same input = **mutate data**

```js
// pure
xs.slice(0,3); // [1,2,3]

xs.slice(0,3); // [1,2,3]

xs.slice(0,3); // [1,2,3]


// impure
xs.splice(0,3); // [1,2,3]

xs.splice(0,3); // [4,5]

xs.splice(0,3); // []
```

```js
// impure: as minimum can be changed (outside of scope)
let minimum = 21;
const checkAge = age => age >= minimum;

// pure
const checkAge = (age) => {
  const minimum = 21; //cannot be changed and inside scope.
  return age >= minimum;
};
```

Make object immutable (pure):
- `const immutableState = Object.freeze({ minimum: 21 });`

## side effects.
**effect = anything that changes when code is ran (other than result)**

**side effect = change of system/observable interaction outside world that occures when calculating result**

examples of side effects:
- changing file system
- inserting record in DB
- HTTP calls
- mutations
- printing to screen/logging
- obtaining user input
- querying DOM
- accessing system state
- ...

## mathematical functions = mapping x values into y values
function = all x values will map to some values in y (1 -> 1 mapping, 1 -> many mapping)

not a functions = if some x values cannot be mapped.

inputs can be anything **inside input space**

##reasons for pure functions
- cacheable = cache ouput from input (for future use)
    - memoization = store info inside memoize cache and check cache if info is stored.
    - cacheing functions = improve performance (e.g. collecting multiple http requests)

- portable / self documenting
    - code is readable and easy to follow!
    - make sure you pass important info as params (keep it pure!!)

- Testable
    - can make unit tests easily and test and repeatable!

- Reasonable
    - pure functions will return the same contents, thus transparent and trustworthy.

- Parallel Code
    - run pure functions in parallel, will not cause side effects.

