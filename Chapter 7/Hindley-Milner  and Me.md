# Hindley-Minler and Me

Type Signatures are ususally written with a system called "Hindley-Milner"
- simple ways to write functions with.
- types can be inferred so there's no need for explicit type annotation.
- useful for compile time checks, and great for documentation.

- JS is dynamic language, so types are inferred (but need to be concious of them.)

## examples of type signatures

```js
/*
Comments are the type signature. Tells you:
- name of function
- type of argument/s
- '->' maps to
- type of output
*/
// capitalise :: String -> String
const capitalise = s => toUpperCase(head(s)) + toLowerCase(tail(s));
capitalise('hElLo'); //Hello

// strLength :: String -> Number
const strLength = s => s.lengthl

// join :: String -> [String] -> String
const join = curry((str, strArr) => strArr.join(str));

// match :: Regex -> String -> [String] OR Regex -> (String -> [String])
const match = curry((regex, str) => s.match(reg));
//so can make make a function out of this
// onHoliday :: String -> [String]
const onHoliday = match(/holiday/ig);


// replace :: Regex -> String -> String -> String
// replace :: Regex -> (String -> (String -> String))
const replace = regex => sub => s => s.replace(regex, sub);
//same as (when curried)
const replace = curry((regex, sub, s) => s.replace(regex, sub));
```

- `strLength()` takes in a String and returns a Number

- `join` takes in a String and String array and returns a String
  - OR takes in a String and returns a function that takes a String array and returns a String.
  - ` join :: String -> ([String] -> String)`

- `match`
  - can group to `match :: Regex -> (String -> [String])`
    - takes a regex and returns a function to make String to String array.
  
- `replace` can use multiple brackets to show all the different functions that can be made out of it, so omit brackets.
  - can think of it as multi arity function -> function that takes a Regex, String, and another String and returns a String.

Other important signature types
```js
// id :: a -> a
const id = x => x; //identity function

// map :: (a -> b) -> [a] -> [b]
const map = curry((f, arr) => arr.map(f));
```

- `id` function takes any datatype (even objects) and returns something of same type.
  - `a` and `b` are just like variables to represent a type. They are the convention
  - IMPORTANT: `a -> b` means 1 type to any type (even if same type), `a -> a` mean has to be same type!
    - `id` may be `String -> String` or `Number -> Number` but not `String -> Number`

- `map` can be seen as: a function that:
  - takes a function that any type `a` to same/different type `b`.
  - this function is then passed to array of `a`'s and results in array of `b`'s

more examples
```js
// head :: [a] -> a
const head = xs -> xs[0];

// filter :: (a -> Bool) -> [a] -> [b]
const filter = curry((f, xs) => xs.filter(f));

// reduce :: (b -> a -> b) -> b -> [a] -> b
// takes in function that takes 'a' and 'b', returns a 'b'
// that function will use b and array of a's to make a b
const reduce = curry((f, x, xs) => xs.reduce(f, x));
```

- `reduce`:
  - takes a function that expects a `b` and `a` to produce a `b`
  - this function will take in a `b` and an array of `a`'s (so `b` and each `a` will be fed through)
  - result will form a `b`

## parametricity

when we introduce type variables (`a` and `b`), parametricity emerges.
- parametricity = a function will act on all types in a uniform manner.
  - make sure code works on all possible types.

`head :: [a] -> a`
- head takes `[a]` and returns `a`. Everything is generic apart from the Array type (array of *something*)
  - because we do not know what `a` is, we must keep it generic so function will work on all possible types.

`reverse :: [a] -> [a]`
- reverse takes `[a]` and returns `[a]`, all we know that it remains an array.
  - type has not changed
  - what this function could be:
    - sort? No, not enough info
    - re-arrange? Yes, but has to do so in predictable way (to remain pure).
    - remove / duplicate? Yes, but remain predictable.

parametricity = polymorphic on what the type will be.

**Type Signatures allows search engine to help find functions!**

## Free Theorems

Using type signatures can give us free theorems

```
// head :: [a] -> a
compose(f, head) === compose(head, map(f));

// filter :: (a -> Bool) -> [a] -> [a]
compose(map(f), filter(compose(p, f))) === compose(filter(p), map(f));
```
- dont need code to know theorems, just follow types
- first theorem (head theorem)
  - get head of array and run function on it is EQUIVALENT TO (and faster than) map over every element then take result.

- second theorem (filter theorem)
  - compose `f` and `p` to check which should be filtered, then apply the `f` on the map EQUIVALENT TO mapping the `f` then filtering the result with `p`.
    - filter will not transform elements, it's signature enforces that `a` will not be touched).

## Constraints

There are things such as **type constraints** that can be used on type variables.

`sort :: Ord a => [a] -> [a]`
- fat arrow `=>` is statement of a fact, `a` must be an `Ord`
  - `a` must implement `Ord` interface.

constraints allow us to:
- more about a type variable
- what the function is up to (what does `sort` do? Easy for this, but other functions could be more complex..)
- restricts the domain (so `a` in `sort` must be order-able)

`assertEqual :: (Eq a, Show a) => a -> a -> Assertion`
- 2 constraints, `Eq` and `Show`
  - ensure to check 'equality' of `a`'s and print difference if not equal.

```js
// then :: Promise p => (a -> b) -> p a -> p b
const then = curry((f, anyPromise) => anyPromise.then(f));
```
- `Promise p` tells us that `p` must be a Promise
  - `p a` and `p b` will be promised holding `a` and `b`
- same goes for other standard built-in objects such as Array.

## Summary
- Hindley-Milner (HM) signatures are used everywhere in functional world.
- simple to read and write
- takes time to master technique of understanding programs through signatures alone.
- best practice to add type signatures to each function you create.
