# Containers and Functors.

## What are containers

How is data handled in functional programs
- data is piped through a series of functions
- containers are used for:
  - control flow
  - error handling
  - asyncronous actions
  - state
  - even effects (e.g. side effects/impure functions)

```js
class Container {
  constructor(x) {
    this.$value = x;
  }
  static of(x) {
    return new Container(x);
  }
}

Container.of(3); // output: Container(3); or {$value = x} (what node will output)
Container.of('hotdogs'); //output: Container("hotdogs")
Container.of(Container.of({name : 'yoda'})); //output: Container(Container({name : "yoda"}))
```
- `Container.of(x)` function will be used a factory to create containers (avoid `new` keyword in code)
  - Kind of like boxing up a datatype (e.g java primitive boxed into objects).

- Container = object with 1 property. Lots of containers just hold 1 thing (but can hold more).
  - in case above, the prop is names `$value`

- `$value` cannot be one specific type (is generic.)

- Data in containers remain in container --> *could* take it out, but defeats purpose of container.

## Functors

- Once values are inside containers, can construct functions for it
  - e.g. `map` function (`Container a` instead of on `[a]`)
```js
// (a -> b) -> Container a -> Container b
Container.prototype.map = x -> {
  //create new container with Container.of
  //argument passed in = function that takes a returns b
  //this. refers to the container that has the value.
  Container.of(x(this.$value));
};

Container.of(2).map(x -> x + 2);
//output: Container(4)
Container.of('flamethrowers').map(s -> s.toUpperCase());
//output: Container('FLAMETHROWERS')
Container.of('bombs').map(concat(' away')).map(prop('length'));
//output: Container(10) -> last map on Container('bombs away')
```
- work with values without taking them out of the container.
  - allows higher abstraction when dealing with data (never deal with data let functions deal with data.)
  - can even allow change in datatype in the container.

  **Functors = a type that implements `map` and obeys some lays.**
  - functors are types that have a interface for mapping
    - they are types that can be mapped.
  - why add functions on containers? Allows abstraction of function application.
    - as functors (mappable containers) to functions for us.
    
## Maybe functions
- Containers are called `identities` (same impact as the `id` function)

```js
class Maybe {
  static of(x) {
    return new Maybe(x);
  }

  get isNothing() {
    return this.$value === null || this.$value === undefined;
  }

  map(fn) {
    return this.isNothing() ? this : Maybe.of(fn(this.$value));
  }

  inspect() {
    return this.isNothing() ? 'Nothing' : `Just(${inspect(this.$value)})`
  }
}
```
- Maybe is a type of container (the basic container we have looked at)
  - it will always check if it has a value (not null or undefined) before running function.
  - allows avoiding `null`'s when mapping!

```js
Maybe.of('apple apple').map(match(/a/ig));
//output: Just(['a', 'a'])

Maybe.of(null).map(match(/a/ig));
//output: Nothing

Maybe.of({name : 'Boris'}).map(prop('age')).map(add(10));
//output: Nothing (as age was undefined.)

Maybe.of({name:  'Dinah', age : 14}).map(prop('age')).map(add(10));
//output: Just(24)
```
- mapping does not throw errors when mapping over nulls/undefined, `Maybe` checks beforehand!

Point free style of map (better to maintain a point free style)
```js
// map :: Functor f => (a -> b) -> f a -> f b
// 'Functor f => ...' tells us that f MUST be a functor
const map = curry((f, anyFunctor) => anyFunctor.map(f));
```

NOTE: this works with Ramda, use pointed version when instructive, point free when convenient

## Usecases of Maybe

Can use `Maybe` when handling data that could fail (avoids using try and catch!)

```js
// safehead :: [a] -> Maybe(a)
const safeHead = xs => Maybe.of(xs[0]);

// streetName :: Object -> Maybe String
//point free style
const streetName = Maybe.of(
  compose(map(prop('street')), safeHead, prop('addresses'))
);

streetName({adresses : []});
//output: Nothing

streetName({addresses : [{ street: 'Shady Ln', number: 4201}]});
//output Just('Shady Ln')
```
- `safehead` like normal head, but added type safety (so no error if not pass in type not array)
  - even though catches errors, it will output 'Nothing'
  - because null/undefined are inside Maybe container, auto null/undefined checks provided!

**Maybe containers = Guaranteed safer software**


