# Monads

## Functor .of()
- Container `of()` is not just there to replace `new` keyword when creating instances of functors.
  - mainly to place values in a *Default Minimal Context*.
- `of` doesnt replace a constructor, but part of an interface called **pointed**
- allows ability to drop any value in type and start mapping staight away!

```js
IO.of('tetris').map(concat('master'));
// result: IO('tetris master')

Maybe.of(1336).map(add(1));
// result: Maybe(1337)

Task.of([{id:2}, {id:3}]).map(map(prop('id')));
// result: Task([2,3])

Either.of('The past, present and future walk into a bar...').map(concat('it was tense.'));
// result: Right('The past, present and future walk into a bar...it was tense')
```
- **NOTE:**
  - `IO` and `Task`'s constructors expect function as argument.
  - `Maybe` and `Either` take data types.

`of` is to create a consistant way to place values, without complexities of specific demands of constructors.
- Minimal Default Context lacks precision, but the idea is good - place any value into container and map straight away.

**NOTE:** `Left.of()` doesnt make any sense - functors place values inside it (using `Either`) which will return `new Right(x)`.
  - can use `Right.of()` as we can map it, but `Left` will only contain error/static String.


There are other functions called `pure`, `point`, `unit`, `return` --> they are versions of the `of` method.
- `of` method is important for monads.

To avoid `new` keyword, some JS tricks
  - `of` keyword
  - functor instances from `folktale` (I used this, but doesnt support IO functor --> reasonable as Task is essentially IO (just couldn't figure it out))
  - `ramda` or `fantasy-land` provide correct `of` method as well as nice constructors that don't rely on `new`

Ramda of example
```js
R.of(null); // [null]
R.of([42]; //[[42]])
//Ramda does not use fantasy land functors, instead relies of core JS datatypes that can act as functors (arrays/[]).
```

## Monad example
- monads are like onions --> they are functors inside functors inside functors ....
  - monads are flat-mappable

```js
const fs = require('fs');

// readFile :: String -> IO String
const readFile = filename => new IO(() => fs.readFileSync(filename, 'utf-8'));

// print :: String -> IO String
const print = x => new IO(() => {
  console.log(x);
  return x;
});

// cat :: String -> IO (IO String)
const cat = compose(map(print), readFile);

cat('.git/config');
// result: IO(IO('[core]\nrepositoryformatversion=0\n'))
```

- IO trapped inside another IO
  - to work on IO(IO(string)) need to map twice `map(map(func))`
  - must also perform `unsafePerformIO().unsafePerformIO()`

```js
// cat :: String -> IO (IO String)
const cat = compose(map(print), readFile);

// catFirstChar :: String -> IO (IO String)
const catFirstChar = compose(map(map(head)), cat);

catFirstChar('.git/config');
// result: IO(IO('['));
```

Another example of functors inside functors, and how to handle them

```js
// safeProp :: Key -> {Key: a} -> Maybe a
const safeProp = curry((x, obj) => Maybe.of(obj[x]));

// safeHead :: [a] -> Maybe a
const safeHead = safeProp(0);

// firstAddressStreet :: User -> Maybe (Maybe (Maybe Street))
const firstAddressStreet = compose(
  map(map(safeProp('street'))), /* Maybe (Maybe (Maybe a)) */
  map(safeHead), /* Maybe (Maybe a) */
  safeProp('addresses') /* Maybe a */
);

firstAddressStreet({
  addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: 'WC2N'}]
})
// result: Maybe(Maybe(Maybe({name: 'Mulburry', number: 8402})))
```
- see that need to use map to peel back layer after layer to run function on value,
  - monads are functors/containers that can autopeel each layer (with maps) to get the value = **flatmappable/chainable and  use join**

```js
const mmo = Maybe.of(Maybe.of('nunchucks'));
mmo.join(); //result: Maybe('nunchucks')

const ioio = IO.of(IO.of('pizza'));
ioio.join(); //result: IO('pizza')

const ttt = Task.of(Task.of(Task.of('sewers')));
ttt.join(); //result: Task('sewers')
```

Example of using join with firstAddressStreet (above)
```js
// join :: Monad m => m (m a) -> m a
const join = mma => mma.join();

// firstAddressStreet :: User -> Maybe Street
const firstAddressStreet = compose(
  join,
  map(safeProp('street')).
  join,
  map(safeHead), safeProp('addresses')
);

firstAddressStreet({
  addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: 'WC2N'}]
})
// Maybe({name: 'Mulburry', number: 8402})
```
- `join` wherever there is nested `Maybe`'s to keep them from getting out of hand.
  - can do same for `IO`: `IO.prototype.join = () => this.unsafePerformIO();`

- `join` does not remove purity, just removed 1 layer of excess functor wrapping.

```js
// log :: a -> IO a
const log = x => IO.of(() => {
  console.log(x);
  return x;
});

// setStyle :: Selector -> CSSProps -> IO DOM
const setStyle = curry((sel, props) => new IO(() => jQuery(sel).css(props)));

// getItem :: String -> IO String
const getItem = key => new IO(() => localStorage.getItem(key));

// applyPreferences : String -> IO DOM
const applyPreferences = compose(
  join,
  map(setStyle('#main')),
  join,
  map(log),
  map(JSON.parse),
  getItem
);

applyPreferences('preferences').unsafePerformIO();
//result: Object {backgroundColor: 'green'}
// --> <div style="background-color: 'green'">
```
- `getItem()` returns IO String, so we can `map` to parse it.
- `log` and `setStyle` return `IO`'s, so `join` to prevent nesting!

## Monad Chaining

code above looks better than nested containers, but may need to call `join` multiple times through `compose`
- can abstract `join` and `map`, into a function called `chain`

```js
// chain :: Monad m => (a -> m b) -> m a -> m b
const chain = curry((f, m) => m.map(f).join()); //point free

// or can be written as:

// chain :: Monad m => (a -> m b) -> m a -> m b
const chain = f = compose(join, map(f)); //uses var f, so not point free?
```
- bundle `map` and `join` into a single function, called `chain`
  - `chain` can be written as `>>=` (pronounced `bind`) or `flatmap`, which are aliases for the same concept.
    - JS community call this `chain`, other places call this `flatmap`

Refractor code above with `chain`

```js
//map/join = old
const firstAddressStreet = compose(
  join,
  map(safeProp('street')),
  join,
  map(safeHead),
  safeProp('addresses')
);

//chain/flatmap
const firstAddressStreet = compose(
  chain(safeProp('street')),
  chain(safeHead),
  safeProp('addresses')
);

//map/join = old
const applyPreferences = compose(
  join,
  map(setStyle('#main')),
  join,
  map(log),
  map(JSON.parse),
  getItem
);

//chain/flatmap
const applyPreferences = compose(
  chain(setStyle('#main')),
  chain(log),
  map(JSON.parse),
  getItem
);
```

Because `chain` can reduce nest effects:
- can be used to capture *sequence* and *variable capture* functionally

```js
// getJSON :: Url -> Params -> Task JSON //so we can chain when return function
getJSON('/authenticate', {username: 'stale', password:'crackers'})
  .chain(user => getJSON('/friends', {user_id: user.id}));
// result: Task([{name:'Seimith', id:14}, {name:'Ric', id=39}])

// querySelector :: Selector -> IO DOM //can chain the return function
querySelector('input.username')
  .chain(({value: uname}) => querySelector('input.email')
    .chain(({value: email})=> IO.of(`Welcome ${uname} prepare for spam at ${email}`)));
//result: IO('Welcome Olivia prepare for spam at olivia@tremorcontrol.net')

Maybe.of(3)
  .chain(three => Maybe.of(2).map(add(three)));
//result: Maybe(5)

Maybe.of(null)
  .chain(safeProp('address'))
  .chain(safeProp('street'));
//result: Maybe(null)
```
- could have written code above with compose, but need a few helper functions and this style lends itself to explicit variable assignment via closure.
- instead using infix version of `chain`, which can be derived from `map(...).join()`
  - `t.prototype.chain = f => this.map(f).join();`
  - could manually make `chain` function on types to make them monads, **but must be map, followed by join**
- could also create a map from `join` and `chain`; and create a `join` from `chain` --> thats just how Mathmatics be sometimes.

**NOTE:** Look more into fantasy land specification/repo
  - the official specification for algebraic data types in JavaScript.

- in code above, innermost chains can be replaced with `map` as outermost chain can handle the nested container.
- `chain` on `Maybe` works, but if returns null, then `chain` is not executed and computation/pipe returns `Maybe(null)`

## Container style programming
- containers (functors/monads) can get confusing when utilising multiple nested containers
  - will need to map and chain to get to values!

- can improve debugging by implementing `inspect` function.
  - learn how to create a "stack" to handle nested containers.

Example: read a file and upload it directly afterwards
```js
// readFile :: Filename -> Either String (Task Error String)
// httpPost :: String -> Task Error JSON
// upload :: String -> Either String (Task Error JSON)
const upload = compose(map(chain(httpPost('/uploads'))), readFile);
```
- code above branches several times, when `readFile` or `upload` - even `httpPost` and `Task` containers, as the containers will either give out a error or result.
  - `readFile` may error when accessing the file
  - `upload` may fail for whatever reason by `Error` in `httpPost`.
- If there is errors, they are inside `Task` containers, so can `chain` to only get out 1 `Task(error)`.

Code above is easy to read/understand (1 line of code, read right to left.)
  - just a reminder why FP makes life easier --> below is how code above it written in imperitive way:

```js
// upload :: String -> (String -> a) -> Void
const upload = (filename, callback) => {
  if(!filename) {
    throw new Error("you need a filename!");
  } else {
    readFile(filename, (errF, contents) => {
      if(errF) throw errF;
      httpPost(contents, (errH, json) => {
        if(errH) throw errH;
        callback(json);
      });
    });
  }
};
```

## Theory

First law is associativity (but a new way of looking at it for monads)
```js
// associativity
compose(join, map(join)) === compose(join, join);

/**
 * Example
 * 
 * M(M(M a)) -> map(join) -> M(M a) //gets rid of middle M (map on outer, so join on middle and inner)
 * M(M a) -> join -> M a //gets rid of outer M (join on outer and inner M)
 * 
 * M(M(M a)) -> join() -> M(M a) //joins outer and middle M
 * M(M a) -> join() -> M a //joins outer and inner M
 * /

```
- this law looks at nested nature of monads, so associativity focuses on `join`ing the inner and outer types to achieve same result.
- **NOTE:** `map(join) != join`
  - `map(join)` = map on outer monad, and joins 2 inner nested monads
  - `join` = joins 2 inner nested monads

Second law is identity
```js
// identity for all (M a)
compose(join, of) === compose(join, map(of)) === id

/**
 * `M a` -> of -> `M(M a)` -> join -> `M a`
 * `M a` -> map(of) -> `M(M a)` -> join -> `M a`
 * `M a` -> id -> `M a`
 * /
```
- states that any monad M, `of` and `join` amounts to an `id`
  - `map(of)` means to us `of` from the inside rather than outside.

- where we say `of` we really mean `M.of`, the method `of`/**pointed** for that monad.

3rd law = composition

```js
const mcompose = (f, g) => compose(chain(f), g);

//left identity
mcompose(M, f) === f

//right identity
mcompose(f, M) === f;

//associativity
mcompose(mcompose(f, g), h) === mcompose(f, mcompose(g, h)); 
```

Just like category theory, 3 laws:
- associativity/association `compose(join, map(join)) === compose(join, join);`
- identitiy `compose(join, of) === compose(join, map(of)) === id`
- compositivity/composition shown above.

Monads form category called "Kleisli category" where all objects and monads and morphisms are chained functions.


## Summary
- Monads allows peeling back of nested computation.
  - can: assign variables, run sequential effects, performs asynchronous tasks --> all without nesting and "{ }"!!

- great for trying to find variables locked inside multiple containers.

- with use of `of`/pointed methods, monads are able to lend us an unboxed value and can place value back in place once done.

- monads are great, but still need other container functions.
  - e.g. what if we want to run API calls at once, and gather results?
    - can be accomplished with monads, but have to wait for each one to finish before calling next.
  - e.g. what if we want to combine several validations?
    - if want to continue validating to gather list of errors, monads are BAD! --> will stop after first `Left` appears.

Next chapter: Applicative Functors.

