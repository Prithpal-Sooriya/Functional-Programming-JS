# Effects and `IO`
- a function that contains side effects can cause issues (as will change information outside of its function.)
  - can wrap it in another function to minimise effects.

example of side effects
```js
// getFromStorage :: String -> (_ -> String)
const getFromStorage = key => () => localStorage[key];
```
- if not surrounded in another funtion, `getFromStorage` would vary output depending on externals.
  - wrapper in place, we will always get same output from same inputs.

Can use `IO` to reach inside container to play with values.

```js
class IO {
  static of(x) {
    returns new IO(() => x);
  }

  constructor(fn) {
    this.$value = fn;
  }

  map(fn) {
    return new IO(compose(fn, this.$value));
  }

  inspect() {
    return `IO(${inspect(this.$value)})`;
  }
}
```

- `IO` differs from functors, the `$value` is always a function.
- `IO` delays impure action by capturing it in a function wrapper.
  - container of the return value of wrapped action, not wrapper itself.
    - can be seen in `of` function: `of :: x -> () -> x`

cannot tell what the value is in IO, until you unwrap (unleash the side effects!).

example use of `IO`
```js
// ioWindow :: IO Window
const ioWindow = new IO(() => window);

ioWindow.map(win => win.innerWidth);
// output: IO(1430) --> browser window width

ioWindow
  .map(prop('location'))
  .map(prop('href'))
  .map(split('/'));
// output IO(['http:', 'localhost', 'blog', 'posts'])

// $ :: String -> IO [DOM]
// copy of jquery func lol
const $ = selector => new IO(() => document.querySelectorAll(selector));

$('#myDiv').map(head).map(div => div.innerHTML);
// IO('I am some inner html')
```
- `ioWindow` is an actual `IO` that we can map
- `$` is a function that returns IO once it is called.
  -> so need to call `$` before we can map it.
- when mapping, we return a new IO for the new value.
  - mapped functions do not run, they get placed at the end of computation built up.
    - **Gang of Four's command pattern**, 'placing the dominoes'

**play with impure values without sacrificing purity of rest of code**

IO functions + mapping build up impure mess, so can be ran by using IO.$value();
  - example:
```js
// url :: IO String
const url = new IO(() => window.location.href);

// toPairs :: String -> [[String]]
const toPairs = compose(map(split('=')), split('&')); //point free

// params :: String -> [[String]]
const params = compose(toPairs, last, split('?')); //point free

// findParam :: String -> IO Maybe [String]
const findParam = key => map(
  compose(
    Maybe.of,
    filter(compse(eq(key), head)),
    params),
  url)

// calling impure code ----------

// run it by calling $value()
findParam('searchTerm').$value();
// Just([['searchTerm', 'HelloWorld']])
```

- the code above stays pure by wrapping `url` in an `IO` and passing to the caller.
  - notice containers are stacked, could have used `IO(Maybe([x]))` --> 3 functors deep: IO, Maybe and array are the functors. (array is mappable, thus is a functor!)

- NOTE:  `IO`'s `$value` isnt really contained value, not even a private property. So cannot call this by mistake (as once called, it will call the remaining impure functions that uses it!!)
  - best to rename to something more expressive!

```js
class IO {
  construct(io) {
    this.unsafePerformIO = io;
  }

  map(fn) {
    return new IO(compose(fn, this.unsafePerformIO));
  }

  ...
}
```

Now when this code is called, instead will be: `findParam('searchTerm').unsafePerformIO()` --> more expressive and understandable.