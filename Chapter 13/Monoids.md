# Monoids

This chapter will examine *monoids* by way of *semigroup*.
- combination of content covered.


## Abstracting addition
- addition is a binary operation (requires 2 values) and returns a value
  - all the values are within the same set.

e.g.

```js
// binary operation
1 + 1 = 2
```

- 2 values in domain (input), and 1 value in codomain (result) in same set (numbers)
  - numbers are "closed under addition" => type won't ever change no matter which ones get tossed into mix.
    - thus can **chain the operation, and will always result in number**

```js
// run addition (binary operation) on any amount of numbers
1 + 2 + 3 + 4 + 5 + ....
```

- addition has ability of **associativity** = allows group operations.
  - makes binary operation great for **parallel computation**, because can chunk and distribute work

```js
// associativity
(1 + 2) + 3 = 6
1 + (2 + 3) = 6
```

- associativity != commutativity (can group operations, but cannot rearrange order)

How to abstract addition to binary operator (for any type?)
- only interested in associative binary operator, so choose less specific interface *Semigroup*
  - Semigroup = type with a `concat` which acts as associative binary operator.

Implement associative binary operation (using `concat`) --> called `Sum`

```js
const sum = x => ({
  x,
  concat: other => Sum(x + other.x)
});
```

- NOTE: use `concat` with some other `Sum` and always return a `Sum`
  - `Sum(x + other.x)` so allows recursion (so can chain concat!)

- Used an object factory instead of typical prototype ceremony, primarily `Sum` (not **Pointed**) and don't want type `new`

```js
Sum(1).concat(Sum(3)); // Sum(4);
Sum(4).concat(Sum(37)); // Sum(41);
```

- now can program to an interface, not an implementation.
  - interface comes from group theory.


- Note: (as said above), `Sum` is not pointed (no `of`), thus not a Functor.
  - it can only hold a number, so `map` does not make sense (cannot transform the underlying value to another type)

Not pointed/functor is useful here: an interface, so can swap out our instance to get different results

```js
const Product = x => ({x, concat: other => Product(x * other.x) });
const Min = x => ({x, concat: other => Min(x < other.x ? x : other.x) });
const Max = x => ({x, concat: other => Max(x > other.x ? x : other.x) });
```

- isnt limited to numbers, can make binary operation with other types!

```js
const Any = x => ({x, concat: other => Any(x || other.x) });
const All = x => ({x, concat: other => All(x && other.x) });

Any(false).concat(Any(true)); // false || true = result: Any(true)
Any(false).concat(Any(false)); // false || false = result: Any(false)

All(false).concat(All(true)); // false && true = result: Any(false)
All(true).concat(All(true)); // true && true = result: Any(true)

[1,2].concat([3, 4]); // result: [1, 2, 3, 4]

'Hello '.concat('World'); // result: Hello World

Map({day: 'Monday'}).concat(Map({tomorrow: 'Tuesday'})) //result: Map({day: 'Monday', tomorrow: 'Tuesday'})
```

- binary function allows: merging data structures, combining logic, building strings, pretty much anything!

- `map` wraps `object` so can run extra methods on it without altering the object itself - change values without changing structure

## All Functors are semigroups
- Functors seen so far can implement semigroup (binary operation) interface
- example `Identity` (a container)

```js
Identity.prototype.concat = other => {
  return new Identity(this._value.concat(other._value));
}

Identity.of(Sum(4)).concat(Identity.of(Sum(1))); // result: Identity(Sum(5))
Identity.of(Sum(4).concat(Identity.of(1))); // result: TypeError: this._value.concat is not a function
```

- It is a *semigroup* if it's `_value` is a *semigroup*

- Other types have similar behaviour:

```js
// combine with error handling
Right(Sum(2)).concat(Right(Sum(3))); // result: Right(Sum(5))
Right(Sum(2)).concat(Left('sum error')); // result: Left('some error')

//combine async
Task.of([1, 2]).concat(Task.of([3, 4])); // result: Task([1, 2, 3, 4])
```

- gets useful when stack these semigroups into cascading combination:

```js
// formValues :: Selector -> IO (Map String String)
// validate :: Map String String -> Either Error (Map String String)

formValues('#signup').map(validate).concat(formValues('#terms').map(validate));
// result: IO(Right(Map({username: 'psooriya', accepted: 'true'})))

formValues('#signup').map(validate).concat(formValues('#terms').map(validate));
// result: IO(Left('need to accept agreement'))

serverA.get('/friends').concat(serverB.get('/friends'));
// result: Task([friend1, friend2])

// loadSetting :: String -> Task Error (Maybe (Map String Boolean))
loadSetting('email').concat(loadSetting('general'));
// result: Task(Maybe(Map({backgroundColor: true, autosave: false})));
```

- 1st example above: combined `IO` holding `Either` holding `Map` to validate and merge form values.

- 2nd example above: message 2 servers, combined their results in async using `Task` and `Array`

- 3rd example above: stacked `Task`, `Maybe`, `Map` to load, parse and merge multiple settings.

These can be `chain`ed or `ap`'d, but *semigroups* capture what we'd like to do more concisely.
- Extends beyond functors --> anything made up entirely of semigroups is a semigroup itself.

```js
const Analytics = (clicks, path, idleTime) => ({
  clicks,
  path,
  idleTime,
  concat: other =>
    Analytics(clicks.concat(other.clicks), path.concat(other.path), idleTime.concat(other.idleTime));
});

Analytics(Sum(2), ['/home', '/about'], Right(Max(2000))).concat(Analytics(Sum(1), ['/concat'], Right(Max(1000))));
// result: Analytics(Sum(3), ['/home', '/about', '/concat'], Right(Max(2000)))
```
- everything knows how to combine itself easily. Can do the same thing fro free just by using the `Map` type:

```js
Map({clicks: Sum(2), path: ['/home', '/about'], idleTime: Right(Max(2000))})
  .concat(Map({clicks: Sum(1), path:['/contact'], idleTime: Right(Max(1000))}));
// result: Map({clicks: Sum(3), path: ['/home', '/about', '/contact'], idleTime: Right(Max(2000))})
```
- can stack and combine as many of these as we'd like.

- Default, intuitive behaviour is to combine what a type is holding
  - however there are cases where can ignore what is inside and combine containers instead.
    - e.g. type `Stream`:

```js
const submitStream = Stream.fromEvent('click', $('#submit'));
const enterStream = filter(x => x.key === 'enter', Stream.fromEvent('keydown', $('#myForm')));

submitStream.concat(enterStream).map(submitForm); // returns: Stream()
```

- can combine event streams by capturing events from both as one new stream.
  - alternately, could have combined them by insisting they hold semigroup.

- there are many possible instances for each type.
  - `Task` can combine by choosing `Right` first instead of `Left` (which has effect of ignoring errors)
    - this is called an **Alternative interface** which inherits thse alternative instances.
    - typically focused on choice rather than cascading combination. (worth looking into if need this functionality)

## Monoids `empty` identity.

- abstracting addition, but lack concept of `zero`
  - `Zero` acts as identity meaning any element added to `0` will return back the same element.
  - abstraction-wise, think of `zero` as a neutral/empty element.
    - should act same on left/right side of arguments for binary operations.

```js
// identity
1 + 0 = 1;
0 + 1 = 1;
```

- call this concept `empty` and create new interface with it.

**Monoid = take semigroup(binary operator/type with `concat`) and add special identity + add special identaty element `empty`**

```js
Array.empty = () => [];
String.empty = () => "";
Sum.empty = () => Sum(0);
Product.empty = () => Product(1);
Min.empty = () => Min(Infinity); // function that give min(infinity, x)
Max.empty = () => Max(-Infinity); // function give max(-infinity, x)
All.empty = () => All(true); // function gives identity (x = true, return true; x=false, return false)
Any.empty = () => Any(false); // function gives identity (x = true, return true; x=false, return false)
```

when is *empty identity* value prove useful
- nearly anywhere (where you can use a `zero`)

codewise, `empty` corresponds to sensible defaults:

```js
const settings = (prefix="", overrides=[], total=0) => ...

//better it so use:
const settings = (prefix=String.empty(), overrides=Array.empty(), total=Sum.empty()) => ....
```
- so when no value given to param, default value used: `sum([]) // result 0`
  - perfect initial value for accumulator (for example)


## Monoid Folding
- `concat` and `empty` fit perfectly in first slots of `reduce` function
  - can actually reduce an array of `semigroup`'s down by ignoring empty value
  - but will soon cause an issue (look at code below)

``` js
// concat :: Semigroup s => s -> s -> s
const concat = x => y => x.concat(y);

[Sum(1), Sum(2)].reduce(concat) //Sum(3)
[].reduce(concat); //TypeError: reduce of empty array with no initial value
```
- error if use `empty` with no initial value
  - need a way to return `NaN`, `false`, or `-1`

- could use `Maybe` but can be more generic.
  - use curried `reduce` function and make a safe version where `empty` value is not optional. = `fold` function!!!

```js
// fold :: Monoid m => m -> [m] -> m
const fold = reduce(concat);
```

- initial `m` is `empty` value.
- take array of `m`'s and reduce them down to 1 value

```js
//param1 = initial seed, param2 = array/monoid
fold(Sum.empty(), [Sum(1), Sum(2)]); // result: Sum(3)
fold(Sum.empty(), []); // result: Sum(0)

fold(Any.empty(), [Any(false), Any(true)]); // result: Any(true)
fold(Any.empty(), []); // result: Any(false)

fold(Either.of(Max.empty()), [Right(Max(3)), Right(Max(21)), Right(Max(11))]); // result: Right(Max(21))
fold(Either.of(Max.empty()), [Right(Max(3)), Left('error retrieving value'), Right(Max(11))]); // result: Left('error retrieving value')

fold(IO.of([]), ['.link', 'a'].map($)); // result: IO([<a>, <button class="link"/>, <a>])
```

- provide manual `empty` value for those last 2 since we cant define one on the type itself
  - totally fine, typed languages can figure that out by themselves, but have to pass it in here.

## Semigroups that are not Monoids
- some semigroups that cannot become monoids, provided by an initial value --> look at `First`
```js
const First = x => ({x, concat: other => First(x)});

Map({id: First(123), isPaid: Any(true), points: Sum(13)})
  .concat(Map({id: First(2242), isPaid: Any(false), points: Sum(1)}));
// result: Map({id: First(123), isPaid: Any(true), points: Sum(14)})
```
- merge couple of accounts and keep `First` id.
  - no way of defining `empty` as this would always be `First`....

## Gran unifying theory

> no content is provided yet on the gitbook about this yet.

## Group theory or Category Theory
- notion of binary operation is everywhere in abstract algebra.
  - primary operation in category theory (e.g. |+| or |x|)

- we cannot, however model operationin category theory without `identity`.
  - reason we start with a semi-group from group theory, then jump to a monoid in category theory once we have `empty`

- monoids form a single object category where morphism is `concat`; `empty` is identity; composition is guaranteed.

### Composition as monoid = `Endo`/endomorphisms (function type `a->a`)
- functions of type `a -> a` (domain and codomain are from same set) = **endomorphisms**

- can make monoid called `Endo`, which captures the idea:

```js
const Endo = run => ({
  run,
  concat: other => Endo(compose(run, other.run))
});
```

- since they are all same type, can treat `concat` via `compose` and the types always line up.

### Monad as Monoid = endofunctors (functors of same type) with `join`
- `join` is an operation which takes 2 (nested) monads and makes them into 1 in associative fashion.
  - it is also a natural transformations or "functor function"

- As previously stated, can make a category of functors as objects with natural tranformations as morphisms.
  - now specialise this to *endofunctors* (functors of same type), then `join` provides us with a `monoid` in the category of Endofunctors (aka monad!)

> google the code on how this is done, take a little time to read - but gives a good general idea on how some monads are monoids.

### Applicative as Monoid
- applicative functors have monoidal formulation -> known in category theory as `lax monoidal functor`
- implement interface as a monoid and recover `ap` from it

```js
// concat :: f a -> f b -> f [a, b]
// empty :: () -> f ()

// ap :: Functor f => f (a -> b) -> f a -> f b
const ap = compose(map(([f, x]) => f(x)), concat);
```

## Summary

Category Theory, Group Theory, Everything is connected!
- Monoids are a powerful modelling tool for broad sections of app architecture.

- think of monoids whenever direct accumulation or combination (binary operation/association (parallel)/empty/folding) is part of application.
  - once got that down, start to stetch the definition to more applications!

- suprising how much you can model with 1 monoid!

## Exercises

No exersises...