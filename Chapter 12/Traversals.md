# Traversals

So far we have:
- used and manipulated functors (map, reduce, filter, curry, compose, applicative functors/function application).
- used and manipulated containers (monads, join/chain, compose, transform)

Now look at Traversals of containers

## Types and Traversals

```js
// readFile :: FileName -> Task Error String

// firstWords :: String -> String
const firstWords = compose(join(' '), take(3), split(' '));

// tldr :: FileName -> Task Error String
const tldr = compose(map(firstWords), readFile);

map(tldr, ['file1', 'file2']);
// result: [Task('hail the monarchy'), Task('smash the patriarchy')]
```
- read bunch of files and end up with useless tasks inside arrays
  - would be nice to deal with `Task Error String` instead of `[Task Error String]` --> we would have 1 future value holding all results = much more amenable to async needs than several future values arriving at their leisure.

```js
// getAttribute :: String -> Node -> Maybe String
// $ :: Selector -> IO Node

//getControlNode :: IO (Maybe (IO Node))
const getControlNode = compose(map($), map(getAttribute('aria-controls')), $);
```
- would be nice to join `IO`'s together, but `Maybe` is in the way.
  - could use natural transformations, but this can be quite bloated
  - best result would be to shift the `Maybe` and `IO` positions so could be simplified to `IO (Maybe Node)`

## Sequence
- Traversable interface consists of 2 functions: `sequence`, `traverse`.

Rearange types using `sequence`
```js
sequence(List.of, Maybe.of(['the facts'])); // [Just('the facts')]
sequence(Task.of, new Map({a: Task.of(1), b: Task.of(2)})); // Task({a: 1, b: 2})
sequence(IO.of, Either.of(IO.of('Hello World'))); // IO(Right('Hello World'))
sequence(Either.of, [Either.of('Hello')]); // Right(['hello'])
sequence(Task.of, left('wing')); // Task(Left('wing'))
```
- nested types get turned inside out --> get the data and add it to the fist param
  - when it is an Either, then take the Left or Right
  - if they are the same, chain/flatmap it.

**Sequence swaps outer and inner applicatives/functors AND chains/flattens**

- inner function is shifted to the outside and visa versa.
- `sequence` is a bit particular about its arguments
```js
// sequence :: (Traversable t, Applicative f) => (a -> f a) -> t (f a) -> f (t a)
const sequence = curry((of, x) => x.sequence(of));
```
- 2nd argument it must be a `Traversable` holding an `Applicative`, which sounds quite restrictive.
  - but happens to be the case most often

- `t (f a)` which gets turned into `f (t a)`.

- 1st argument is merely a crutch and only necessary in an untyped language.
  - constructor (our of) provided so that we can invert map-reluctant types (like `Left`)

`Sequence` can shit types around with precision. How does it work?
```js
class Right extends Either {
  //....
  sequence(of) {
    return this.$value.map(Either.of);
  }
}
```

- if `$value` is a functor (must be an applicative) can simply `map` constructor to the type.
  - notice ignored `of` parameter, passed in in case that mapping isnt possible (e.g. `Left`).
```js
class Left extends Either {
  //...
  sequence(of) {
    return of(this);
  }
}
```
- like types to end up in the same arrangement, therefore necessary for types like `Left` that don't hold inner applicative.
  - Applicative interface requires that first have a **pointed funtor**, so have `of` to pass.

- in a language with type system, outer type can be inferred from the signature, and does not explicitly be given.

**Sequence = swapping ALL pairs from left to right** = (F=Functor) F0 with F1, F1 with F2, F2 with F3, ... depending on how many nested functors

## Effective Assortment (Traverse)
- different orders have different outcomes where our containers are concerned.
  - `[Maybe a]` (collection of possible values) = all or nothing - is different from... 
  - `Maybe [a]` (possible collection of values) = keep good values.
  - `Either Error (Task Error a)` could represent client side validation.
  - `Task Error (Either Error a)` could represent server side validation.
    - types can be swapped for different effects

```js
// fromPredicate :: (a -> Bool) -> a -> Either e a

// partition :: (a -> Bool) -> [a] -> [Either e a]
const partition = f => map(fromPredicate(f));

// validate :: (a -> Bool) -> [a] -> Either e [a]
const validate = f => traverse(Either.of, fromPredicate(f));
```
- 2 different functions based on if we `map` or `traverse`.
  - 1st function (`partition`) will give us an array of `Left`s and `Right`s according to the predicate function.
    - useful to keep precious data around for future use, rather than filtering it out.
  - 2nd function (`validate`) will give uss the first item that fails the predicate in `Left` or all items in `Right`.

By choosing different type order, get different behaviour.

example of `traverse` function in `List`, to see how the `validate` method is made.
```js
traverse(of, fn) {
  return this.$value.reduce(
    (f, a) => fn(a).map(b => bs => bs.concat(b)).ap(f),
    of(new List([]))
  );
}
```
- This just runs a `reduce` on a list. Reduce function `(f, a) => fn(a).map(b => bs => bs.concat(b)).ap(f)`
  - `reduce(..., ...)` = first argument is list of things (`$value`).
    - 2nd argument = Need a function `f` for the accumulator, and `a` the iteree to return us a new accumulator.
  - `of(new List([]))`
    - seed value is `of(new List([]))`, which in our case is `Right([]) :: Either e [a]`.
    - `Either e [a]` will also be our final resulting type.
  - `fn :: Applicative f => a -> f a`
    - apply it to above example, `fn` is actually `fromPredicate(f) :: a -> Either e a`
    > fn(a) :: Either e a
  - `.map(b => bs => bs.concat(b))`
    - When `Right`, `Either.map` passes the right value to the function and returns new `Right` with result.
      - function has 1 param (`b`), and returns another function (`bs => bs.concat(b)`, where `b` is in scope due to the closure)
      - when `Left`, left value is returned.
    > fn(a).map(b => bs => bs.concat(b)) :: Either e ([a] -> [a])
  - `.ap(f)`
    - `f` is an applicative here, so we can apply the function `bs => bs.concat(b)` to whatever value `bs :: [a]` is in `f`
    - `f` comes from initial seed and has folllowing type `f :: Either e [a]` --> preserved when we apply `bs => bs.concat(b)`
    - when `f` is `Right`, this calls `bs => bs.concat(b)`, which returns `Right` with item added to list.
    - when `f` is `Left`, left value (from previous step or previous iteration) is returned.
    > fn(a).map(b => bs => bs.concat(b)).ap(f) :: Either e [a]

This transformation code is achieved with 6 lines of code (in `List.traverse`) and is accomplished with `of` (pointed), `map` and `ap`
  - so will work on any Applicative Functor!

Great example of how thsoe abstraction can help to write highly generic code
  - that can be declared and checked at the type level.


Above is messy! what it boils down to:
1. take an `of`/applicative and a function (which is usually a monad/list)
2. use reduce: basically a `foldRight` function (1st argument) that uses an `acc` accumulator of starting seed = empty list (2nd argument)
3. we swap outer and inner applicatives/monads from `f(g(x))` to `g(f(x))`
4. concat the swapped value onto the list (remember reducing list, so going through each value current list)

**l.traverse(f) === l.map(f).sequence**
**manoidal is another term for applicative!!!**

## Return of types

time to revisit and clean our initial examples:
```js
// readFile :: FileName -> Task Error String

// firstWords :: String -> String
const firstWords = compose(join(' '), take(3), split(' '));

// tldr :: FileName -> Task Error String
const tldr - compose(map(firstWords), readFile);

//instead of //map(tldr, ['file1', 'file2']); //result: [Task('hail the monarchy'), Task('smash the patriarchy')]
//use traverse (map(f).sequence())
traverse(Task.of, tldr, ['file1', 'file2']); //result: Task(['hail the monarchy', 'smash the patriarchy']) -> not wrapped in array!
```
- Using `traverse` instead of `map` allowed to place all `Task`s into an array of results (instead of array of tasks)
- this is like `promise.all()`, except isn't just one-off custom function --> it is generic and can work on any *traversable* type.

Clean up of last example:
```js
// getAttribute :: String -> Node -> Maybe String
// $ :: Selector -> IO Node

// getControlNode :: IO (Maybe Node) //instead of IO (Maybe (IO Node))
const getControlNode = compose(
  chain(traverse(IO.of, $)), //returns IO.of(IO (Maybe Node)) then flattens the outside to givew IO (Maybe Node)
  map(getAttribute('aria-controls')), //return Maybe IO Node
  $ //return IO Node
);
```
- instead of `map(map($))` can have `chain(traverse(IO.of, $))`, which inverts the types as it maps, and flattens the two `IO`'s with `chain`

## Traverse laws
- These laws are useful code guarantees.

Here are some laws

### Identity
```js
const identity1 = compose(sequence(Identity.of), map);
const identity2 = Identity.of;

// rest it out with Right

identity1(Either.of('stuff'));
// result: Identity(Right('stuff'))

identity2(Either.of('stuff'));
// result: Identity(Right('stuff'))
```
- place `Identity` in our functor, the turn inside out with `sequence` === same as placing it on outside to begin with.

### composition
```js
const comp1 = compose(sequence(Compose.of), map(Compose.of));
const comp2 = (Fof, Gof) => compose(Compose.of, map(sequence(Gof), sequence(F.of)));

// Test with types lying around
comp1(Identity(Right([true])));
// Result: Compose(Right([Identity(true)]))

comp2(Either.of, Array)(Identity(Right([true])));
// Result: Compose(Right([Identity(true)]))
```
- law preserves composition as one would expect.
  - if we swap compositions of functors, shouldnt see any suprises since composition is functor itself.
- in the test, used `true` and `Right`, `Identity` and `Array`.
  - Libraries like quickCheck and jsVerify can help test if laws by fuzz testing the inputs.

- as a natural consequence of above law, we get the ability to fuse traversals
  - nice from a performance standpoint.

### Naturality
```js
const natLaw1 = (of, nt) => compose(nt, sequence(of));
const natLaw2 = (of, nt) => compose(sequence(of), map(nt));

//test with random natural transformation and Identity/Right functor

// maybeToEither :: Maybe a -> Either () a
const maybeToEither = x => (x.$value ? new Right(x.$value) : new Left());

natLaw1(Maybe.of, maybeToEither)(Identity.of(Maybe.of('Test 1')));
// Right(Identity('Test 1')

netLaw2(Either.of, maybeToEither)(Identity.of(Maybe.of('Test 1')));
// Right(Identity('Test 1')
```
- if swap types around then do natural transformation on outside === mapping natural transformation (change inner type) then flipping types.

Natural consequence of this law:

`traverse(A.of, A.of) === A.of`

## Summary
- Traversable is a powerful interface, gives ability to rearrange types with ease.
- Achieve different effects with different orders.
  - avoid nesting of same type by auto joining!

Next chapter: Monoids, completion of book (bring everything together!)