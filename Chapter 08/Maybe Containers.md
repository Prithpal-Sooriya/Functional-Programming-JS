# Maybe functions

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

Handling `Maybe` catches (Nothing result)

```js
// withdraw :: Number -> Account -> Maybe(Account)
const withdraw = curry((amount, {balance})) =>
  Maybe.of(balance >= amount ? { balance: balance - amount} : null);

// hypothetical function, just to use as an example
// updateLedger :: Account -> Account
const updateLedger = account => account;

// remainingBalance :: Account -> String
const remainingBalance = ({balance}) => `Your balance is $${balance}`;

// finishTransaction :: Account -> String
const finishTransaction = compose(remainingBalance, updateLedger);

// getTwenty :: Account -> Maybe(String)
const getTwenty = compose(map(finishTransaction), withdraw(20));

getTwenty({balance : 200.00});
// Just('Your balance is $180');

getTwenty({balance : 10.00});
// Nothing //because return null from withdraw --> seems like Maybe breaks out of function pipe?
```

`withdraw` will return a `Nothing` if short on cash.
- using intentional 'null' to catch errors (will bubble up the Maybe.)
  - if `withdraw` fails (maybe.of(null)), then `map` will sever rest of application, since it doesn't run mapped functions (`finalTransaction`).


## Container returns
- functions programming will need to have an end point (cannot pipe forever)
  - e.g. filesystem, output message, etc.
- functions job: recieve data, transform data, carry that data along.
  - cannot output a `Maybe`, need to take out of container.

```js
// maybe :: b -> (a -> b) -> Maybe a -> b
const maybe = curry((v, f, m) => {
  if(isNothing) {
    return v
  }
  return f(m.$value);
});

// getTwenty :: Account -> String
//will use function above, if pass Just to Maybe, run next function, else return 1st argument.
const getTwenty = compose(maybe("You're broke!", finishTransaction), withdraw(20));

getTwenty({balance : 200.00});
// output: "your balance is $180"

getTwenty({balance : 10.00});
// output: "you're broke!"
```
- maybe in to a maybe
  - if returns true, then will run function/output
  - if returns false, then will run a static value.
- maybe is equivalent to `if/else`
  - if use `map(Maybe.of(...))` instead of `maybe(Maybe.of(..))` equivalent to `if (x!==null) return f(x)`

`Maybe` is also known as `Option` in other languages (Swift, Scala, etc)

Maybe types allows working with map null/undefined values.

`Some(x) / None` or `Just(x) / Nothing` instead of maybe that does a null check on its value.
