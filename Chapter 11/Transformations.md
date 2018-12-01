# Transformations

Natural Transformations in the context of practical utilitiy in everyday code.

## Issue with Nesting
- nesting = 2 or mroe different types combined together around a value
  - e.g.
```js
Right(Maybe('b'));

IO(Task(IO(1000)));

[Identity('ten thousand')];
```
- if you wrap different containers together, it makes it hard to unpeel it (e.g. you cannot use applicatives/`ap` on it)

Potential real world example
```js
// getValue :: Selector -> Task Error (Maybe String)
// postComment :: String -> Task Error Comment
// validate :: String -> Either ValidationError String

// saveComment :: () -> Task Error (Maybe (Either ValidationError (Task Error Comment)))
const saveComment = compose(
  map(map(map(postComment))), //unpeal 3x Task(Maybe(Task Comment)) to get Comment and use.
  map(map(validate)), // unpeel 2x Task (Maybe String) to get String, and will return Task Error Comment
  getValue('#comment') //Task Error (Maybe String) --> correct path will get Maybe String
);
```
Code explained above:
- start getting user input with `getValue('#comment')`, which is an action that gets text on an element.
  - It will error handle the element (error finding element or string does not exist) --> so will return `Task Error (Maybe String)`

- Then have to `map` over both `Task` and `Maybe` to pass text to `validate`
  - `validate` will return `Either` a `ValidationError` or output `String` --> `Either (Validation error) or Either (String)
    - resulting container: `Task Error (Maybe (Either ValidationError String))`

- Finally have to `map` three times over the `Task`, `Maybe` and `Either` to get the inner value to be passed into postComment, which in turn gives a Task.
  - resulting container: `Task Error (Maybe (Either ValidationError (Task Error Comment)))` --> so will then need to map 4x to get value next time!!!


## Natural Transformations

*Natural Transformations* are a "morphism between functors" --> a function which operates on the container themselves.
- typewise, it is a function `(Functor f, Functor g) -> f a -> g a`
  - what makes it special is that we cannot peek at contents of the functor.
    - like exchange of classified information

natural transformations in code:
```js
// nt :: (Functor f, Functor g) -> f a -> f g
//nt is the natural transformation
compose(map(f), nt) === compose(nt, map(f));
```
- what code says: can run *natural transformation* then `map` OR `map` then run *natrual transformation*
  - follows `free theorem` through natural transformations (and functors) are not limited to functions on types.

## Principled Type Converstions
- Many languages support type conversion:
  - `String` to `Boolean`, `Integer` to `Float` (JS only has `Numbers`)

- Algebraic containers also have theory for container conversion

```js
// idToMaybe :: Identity a -> Maybe a
const idToMaybe = x => Maybe.of(x.$value);

// idToIO :: Identity a -> IO a
const idToIO = x => IO.of(x.$value);

// eitherToTask :: Either a b -> Task a b
const eitherToTask = either(Task.rejected, Task.of);

// ioToTask :: IO a -> Task () a
const ioToTask = x => new Task((rejected, resolve) => resolve(x.unsafePreform()));

// maybeToTask :: Maybe a -> Task () a
const maybeToTask = x => (x.isNothing ? Task.rejected : Task.of(x.$value));

// arrayToMaybe :: [a] -> Maybe a
const arrayToMaybe = x => Maybe.of(x[0]);
```
- changing 1 functor to another.
  - we are permitted to lose information along the way so long as the value to `map` doesn't get lost in shuffle.
    - `map` must carry on, even after transformation.

- one way to look at it is we are transforming our effects.
  - `ioToTask` as converting synchronous to asynchronous.
  - `arrayToMaybe` from nondeterminism to possible failure.
  - NOTE: cannot convert asynchronous to synchronous in JS, so cannot right a `taskToIO` --> it would be a supernatural transformation.

## Feature envy
- want features of another type (like `sortBy` on a `List`).
  - natural transformations provide a nice way to convert target type whilse maintaining `map`
```js
// arrayToList :: [a] -> List a
const arrayToList = List.of;

//f, h and g are some functions for the list
const doListStuff1 = compose(sortBy(h), filter(g), arrayToList, map(f));
const doListStuff2 = compose(sortBy(h), filter(g), map(f), arrayToList); // law applied
```
- easy way of doing list functions, by using `compose`
  - best to optimise / fuse operations together by moving `map(f)` to left of natural transformation (shown in `doListStuff2`)
    - do natural transformation first, then can to list stuff!!
  
## Isomorphic JavaScript
- when can go back and forth to different types, that is **imorphism**
  - 2 types are isomorphic if we can provide the "to" and "from" natural transformation as proof.

```js
// promiseToTask :: Promis a b -> Task a b
const promiseToTask = x => new Task((reject, resolve) => x.then(resolve).catch(reject));

// taskToPromise :: Task a b -> Promise a b
const taskToPromise = x => new Promise((resolve, reject) => x.fork(reject, resolve));

const x = Promise.resolve('ring');
taskToPromise(promiseToTask(x)) === x;

const y = Task.of('rabbit');
promiseToTask(taskToPromise(y)) === y;
```
- As shown, `Promise` and `Task` are isomorphic.
  - can also write a `listToArray` to implement `arrayToList` and show that they are isomorphic too.

- Counter example: `arrayToMaybe` is not an isomorphism since it loses information.
```js
// maybeToArray :: Maybe a -> [a]
const maybeToArray = x => (x.isNothing ? [] : [x.$value]);

// arrayToMaybe :: [a] -> Maybe a
const arrayToMaybe = x => Maybe.of([x]);

const x = ['1', '2'];

// not isomorphic
maybeToArray(arrayToMaybe(x)); //result: ['1']

// but is a natural transformation
compose(arrayToMaybe, map(replace('1', '3')))(x); // Just('3')
// same as
compose(map(replace('1', '3'), arrayToMaybe))(x); // Just('3')
// --> best practice to place natural transformation at start (so bottom example!)
```
- code above is a natural transformation, since `map` on either side gives same result!
  - however not isomorphc, as cannot prove identity!

Isomorphisms are powerful and pervasive concept!

## Broader Definition of Natural Tranformations and Isomorphism.
- structural functions are not limited to type conversions=

examples of other type conversions
```js
reverse :: [a] -> [a]
join :: (Monad m) => m (m a) -> m a
head :: [a] -> a
of :: a -> f a
```
- natural transformation laws hold for these functions too.
  - `head :: [a] -> a` can be viewed as `head :: [a] -> Identity a`
    - free to insert identity wherever whilst proving laws. In turn `a` is isomorphic to `Identity a`

## One Nesting Solution
-  can use natural transformations to solve nesting functor issues (make them `join`/`chain`able)

```js
// getValue :: Selector -> Task Error (Maybe String)
// postComment :: String -> Task Error Comment
// validate :: String -> Either ValidationError String

// saveComment :: () -> Task Error Comment //not a Task Error (Maybe (Either ValidationError (Task Error Comment)))
const saveComment = compose(
  chain(postComment), //result Task Error (Task Error Comment) --> chained = Task Error or Task Comment! (thus Task Error Coment)
  chain(eitherToTask), // result: Task Error (Task ValidationError String) --> chained = Task Error or Task String
  map(validate), // result: Task Error (Either ValidationError String)
  chain(maybeToTask), // result: Task Error (Task String) --> chained = Task Error or Task String
  getValue('#comment') // result: Task Error (Maybe String)
);
```
- reason why type signature comments are useful!
  - look at outcome of function, then use appropriate natural transformation --> then chain/join to remove nesting of same type!

- `chain(maybeToTask)` and `chain(eitherToTask)` have same effect --> transform type to Task and then chain (to remove a nested Task)

## Summary

Natural transformations are functions on functors themselves.
- extremely important concept in category theory and will start to appear everywhere once more abstractions are adopted.
  - for now, have scoped them to a few concrete applications.

Natural transformations work by converting types guarantee that composition will hold.
- also help with nested types (general effect of homogenizing functors to lowest common denominator.)
  - in practice, want to bring all to same type with most volitile effects (`Task` in most cases.)
  - --> want to bring down to a `Task` or an `Either` in most cases.

- nested types usually occurs from branching types --> `Either, Task and Maybe` are the main causes.
  - implicit effects are more insidious.

- need more tools before tackling large nested type combinations

Next chapter: Traversing the stone (applications of fp and tackling combined types)