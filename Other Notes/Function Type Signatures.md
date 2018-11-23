# Function Type Signatures

## :: type (function that is mappable) ('member of')
- `::` = mappable functions = `add::Number,Number->Number`
  - `<name of functions>` :: (`<argument types>`) -> `<return type>`
  - `const add = (x, y) => x + y` is type signature of above
    - curried version `const add = x => y => x + y` --> curried functions are better to work with (can partial application)

  - hascal (curring to turn multi arity function into unary function): `add :: int -> int -> int`
  - **Partial Application** = pass in only 1 argument in mulit arity function will return a function with rest of arguments.
    - sometimes because of this you can do `add(1)(2) <curried function> === add(1, 2) <multi arity>`

- `inc :: int -> int` == `const inc = x => x + 1`
  - functions like this map DOMAIN (input) to CODOMAIN (output)
  - multi arity functions are curried functions that will go through many DOMAIN/CODOMAINS until reach end

- `hello :: String -> String` == `const hello = name => 'Hello ${name}'`

## -> type ('map functions of x to y') (maps to)
- `->`
  - reading `inc :: int -> int` = 'increment' is a member of 'set of all functions' that map functions of integers to integers
  - show map functions to functions
    - `inc`, `dec`, `add5` can all be maped to `int -> int`

  - there can be other sets like: `int -> (int -> int)`, therefore `add(5, inc)` is valid

## ~> type (object type signature)
- `~>`
  - `greet:: String ~> String`

```js
class peron {
  constructor (s) {
    this.name = s;
  }
  greet () {
    return "hello" + this.name;
  }
}
```
- NOTE: function doesnt reside on object, method resides on object and uses `this` (access resides in object/scope of object)
  - `greet :: String -> String` for FUNCTIONS
  - `greet :: String ~> String` for METHODS (references object)
    - so cannot use on other objects, must be object of right type (has to be a Person object or any that inherit person)


## => type (type constraints) ('method maps to')
- `=>`
  - `greet:: Person a => a ~> () -> String`
    - 'greet is a method such that if Person a invoke it (no args) you get a String.
    - `Person a => a
```js
class Person{
  ...
  handshake (s) {
    return `Hello ${s}, I'm ${this.name}`
  }
}
```
- Haskall: `handshake:: Person a => a ~> String -> String`
  - pass in string, will get a string
- Function type declaration: `handshake:: String -> String -> String`
  - hanshake is a member on the set of functions that takes a function(String -> String) and gives a String.
  - 1st string is *implicit* (from within object Person), so thats where a s

## 'a'/lowercase letters
- `a` = lowercase letters
  - acts as a variable for a CLASS TYPE
  - `handshake:: Person a => a ~> String -> String` --> the `Person a => a ~>` is whereever we say `a` we mean `<type Person>`.


## Conclusion
- these are basic function type signatures
  - important to understand if ever want to progress with functional programming and JS Fantasy Land Spec.
  - in Haskall `add x y = x + y` it will infer to `add:Num a => a -> a -> a` if there are other type classes (that are not primitive).