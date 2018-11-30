# Applicatives

## What is an Applicative Functor

**Applicative functor = apply one functor to another**
- e.g. say have 2 functors (of same type) and want to call a function with both values as args.
  - adding values of 2 `containers`

```js
// Can't do this, because numbers are boxed inside containers
add(Container.of(2), Container.of(3));

// can to it by using 'map' function
const containerOfAdd2 = map(add, Contaier.of(2));
//Container(add(2))
```
- have a `Container` that has a partially applied function inside. --> `Container(add(2))`
  - if we apply `add(2)` to the `Container.of(3)` we would complete the call --> applying 1 functor to another

```js
//Applicative functor complete (uses partially applied function inside a functor, and implements it on other functor)
Container.of(2).chain(two => Container.of(3).map(add(two)));
```
- issue with code above, need to chain/flatmap out monad to then run map on inner monad!!
  - code seems really messy just to do a simple job!!

## Succinct Applicative Functor `ap`.

- `ap` is a function that can apply the function contents of 1 functor to the value contents of another.

```js
Continer.of(add(2).ap(Container.of(3)));
//result: Container(5)

//can also be written as
Container.of(2).map(add).ap(Container.of(3));
//result: Container(5)
```
- code above is much more cleaner and easier to read.
  - `Container(3)` is not trapped in monads/nested monadic function/
- NOTE: `add` gets partially applied during first `map`, so this only works when `add` is curried.

How `ap` is made:

```js
Container.prototype.ap = otherContainer => {
  return otherContainer.map(this.$value);
}
```
- `this.$value` will be a function and will be accepting another functor --> so only need to `map` it.

Interface definition:
> An Applicative Functor is a pointed functor with an `ap` method.
- REMEMBER: `pointed` means contains an `of` function. **Has to be pointed!**

`ap` Law:

```js
// F is functor
// f is function
// x is value
F.of(x).map(f) === F.of(f).ap(F.of(x));
```
- Mapping `f` is equivalent to `ap`ing a functor of `f`. --> Functor map function === Functor ap Functor.
  - we can place `x` into Container and `map(f)` OR can lift both `f` and `x` into containers, and `ap` them.

Exampel of `ap` Law:
```js
Maybe.of(add).ap(Maybe.of(2)).ap(Maybe.of(3));
//result: Maybe(5)

Task.of(add).ap(Task.of(2)).ap(Task.of(3));
//result: Task(5)
```
- AWESOME: can wrap everything in containers now even functions!!
  - above version is not point free, but clean way of combining containers with functions and values.
- Using `ap` and Containers allows better async actions/purity --> e.g. Task container (better example given below).


## Applicative Functor Example

Example application: Building a site and want to retrieve both list of tourist destinations and local events.
- tourist destination is an API call, and so is local events.

```js
// Http.get :: String -> Task Error HTML

const renderPage = curry((destinations, events) => {/* Render page code */})

Task.of(renderPage).ap(Http.get('/destinations')).ap(Http.get('/events'));
// result: Task("<div>some page with dest and events</div>")
```
- `ap` is read from right to left, so will first `Http.get` the events then the destinations, which will be passed to `renderPage`
  - using partial application to achieve this result. Must ensure `renderPage` is curried, or will not wait for both `Task`s to finish.

- Monadic version, one `Task` must finish before next `Task` fires off, this will run both `Http.get` responses together.
  - since we don't need destinations to retrieve the events, we are free from sequential evaluation. 

Another example of `ap`
```js
// $ :: String -> IO DOM
const $ = selector => new IO(() => document.querySelector(selector));

// getVal :: String -> IO String
const getVal = compose(map(prop('value')), $);

// signIn :: String -> STring -> Bool -> User
const signIn = curry((username, password, rememberMe) => {/* Signin code */});

IO.of(signIn).ap(getVal('#email')).ap(getVal('#password')).ap(IO.of(false));
// result: IO({id:3, email:'gg@allin.com'})
```
- `signIn` is a curried function with 3 arguments (therefore a partial application function), so can use `ap` to get each arg.

- also note that 2 arguments end up naturally in `IO`, last argument needs help from `IO.of` since `ap` expects function and all arguments to be in same type
  - **AP requires all args and function to be of same type!! So cannot mix containers!!**

## Point free Applicative Functors

- since we know `map` is equivalend to `of/ap` from this Law (above) `F.of(x).map(f) === F.of(f).ap(F.of(x))`
  - can write generic functions that will `ap` as many times as we specify

```js
//f1,2,3,... are functors (of same type)
//g is a function
const liftA2 = curry((g, f1, f2) => f1.map(g).ap(f2));
const liftA3 = curry((g, f1, f2, f3) => f1.map(g).ap(f2).ap(f3));
//same for liftA4 and rest.
```
- `liftA2` and rest are: lifting peices into applicative functor.

- at first, what is point of `liftA2`, `liftA3` (static number of arguments) and rest as JS could do this dynamically
  - reason: FP useful to partially apply `liftA(N)` itself, so cannot vary in argument length.

Another example:

```js
// checkEmail :: User -> Either String Email
// checkName :: User -> Either String String

const user = {
  name: 'Prithpal Sooriya',
  email: 'xyz'
}l

// createUser :: Email -> String -> IO User
const createUser = curry((email, name) => {/* Create User code */});

Either.of(createUser).ap(checkEmail(user)).ap(checkName(user));
// result Left('invalid email')

liftA2(createUser, checkEmail(user), checkName(user));
// result: Left('invalid email')
```
- since `createUser` takes 2 arguments, can use corresponding `liftA2`.
- 2 statements abvoe ar equivalent, but `liftA2` doesn't need to mention `Either` container
  - more generic and flexable, as no longer coupled to specific type!

**LiftA2/3/... function allows ap, but with any starting type container function! (rest of arguments must still be of same type)**

Previous examples written with `lift`
```js
liftA2(add, Maybe.of(2), Maybe.of(3));
// result: Maybe(5)

liftA2(renderPage, Http.get('/destinations'), Http.get('/events'));
// result: Task('<div>some page with dest and events</div>')

liftA3(signIn, getVal('#email'), getVal('#password'), IO.of(false));
// result: IO({ id: 3, email: 'gg@allin.com' })
```

## Operators

Languages like Haskell, Scala, PureScript, Swift, it is possible to create own infix operators
```js
// Haskell / PureScript
add <$> Right 2 <*> Right 3

// JavaScript equivalent
map(add, Right(2)).ap(Right(3));
```
- `<$>` is a `map` (aka `fmap`)
- `<*>` is an `ap`

The code above allows more natural function application style, and can help remove brackets '( )'

## Derived functions
- All interfaces shown so far are built off eachother and obey set of laws.
  - can define some weaker interfaces in terms of the stronger ones.

- e.g. know an applicative is first a functor --> if have an applicative instance, surely can define a functor of our type.

from law above, where `of/ap` is equivalent to `map`, can define `map` for free:
```js
X.prototype.map = f => {
  return this.constructor.of(f).ap(this);
};
```

- monadsa are top of the food chain, so if have a `chain`, we can get functor and applicative for free:
```js
// map derived from chain
X.prototype.map = f => {
  return this.chain(a => this.constructor.of(f(a)));
};

// ap derived from chain/map
X.prototype.ap = other => {
  return this.chain(f => other.map(f));
};
```

- If can define a monad (map and flatmap/chain), can define both applicative and functor interfaces.
  - we can get all the functor/monad operations for free! Can even examine this type and automate the process.

- `ap`'s appeal is the ability to run things concurrently, so defining via `chain` is missing out on that optimisation.

- why not just use monads (does everything!)? because best to use best available datatype on what you need.
  - keeps cognitive load low by ruling out possible functionality.
    - For this reason, good to prefer applicatives over monads.

- Monads can sequence computation, assign variables, halt further execution --> all thanks to downward nesting structure.
- Applicatives/`ap` needn't concern themselves with any of these functions.

## Laws

All these types (functors, monads, applicatives) have laws they abide to
- e.g. Applicatives/`ap`'s are "closed under composition", so `ap` will never change container types --> reason why may want to use it over monads.

- applicatives also have other different affects
  - can stack our types knowing they will remain the same during the application (exmaple below)

```js
const tOfM = compose(Task.of, Maybe.of);

liftA2(liftA2(concat), tOfM('Rainy Days and Mondays'), tOfM(' always get me down'));
// result: Task.of(Maybe('Rainy Days and Mondays always get me down'))
// outer liftA2 will do <f1>toOfM(liftA2(concat)).ap(<f2>toOfM(...))
// guessing inner liftA2 works as a curry?
```
- as shown above, no need to worry of types getting in the mix

### Identity Law

```js
// identity
A.of(id).ap(v) === v
```
applying `id` all from within a functor should not alter value in `v`

for example
```js
const v = Identity.of('Prithpal Sooriya');
Identity.of(id).ap(v) === v; //returns true; id is the function id() (returns same type given.)
```
- `Identity.of(id)` does nothing.
- `of/ap` is same as `map` --> so this law is same as `map(id) === id` this is true

### Homomorphism

```js
  // homomorphism
  A.of(f).ap(A.of(x)). === A.of(f(x));
```
- *homomorphism* = structure preserving `map`.
  - functor is homomorphism between categories as it preserves original category's structure under the mapping.

- really just stuffing normal functions and values inside containers and running the computation in there.
  - so should just come out with same result.
e.g.
```js
Etiher.of(toUpperCase).ap(Either.of('oreos')) === Either.of(toUpperCase('oreos'));
```

### Interchange
- interchange law states that it doesnt matter if we choose to lift our function into the left or right side of `ap`

```js
// interchange
v.ap(A.of(x)) === A.of(f => f(x)).ap(v);
```

example:
```js
const v = Task.of(reverse);
const x = 'Sparklehorse';

v.ap(Task.of(x)) === Task.of(f => f(x)).ap(v);
```

### Composition
- composition is a way to check that our standard function composition holds when applying inside of containers.

```js
// composition
A.of(compose).ap(u).ap(v).ap(w) === u.ap(v.ap(w));
```

example:
```js
const u = IO.of(toUpperCase);
const v = IO.of(concat('& beyond'));
const w = IO.of('space ');

IO.of(compose).ap(u).ap(v).ap(w) === u.ap(v.ap(w));
```

## Summary
Applicatives = functor application of another function --> easy way to perform computation of containers that hold values and functions.

- good use case for applicatives is when one has multiple functor arguments.
  - give us ability to apply functions to argurments all within functors/containers.

- could do all this with monads, but should prefer applicative functors when we aren't in need of monadic specific functionality.

- almost finished with container API's
  - learn how to `map`, `chain` `ap`

Next chaper, learn how to work better with multiple functors and disassemble them in a principled way.