# Summary
Functors = mappable datatypes
  - arrays, Container, Maybe container, Either container, IO container, Task container, objects with a map function!
  - trees, lists, maps, pairs, ... (iterable data structures)
  - Event streams, Observables (also functors!)

Container = functor that stores 1 (or many) values, can't (shouldn't) get data out from it!
  - Follows Identity law.

Maybe = Container that checks null
  - Will return a static output (if error) (e.g. String), or Just(data) if works.

Either = Container that controls flow (if/else)
  - Will return Right(data) if correct, Left(data) if incorrect.

IO = identity container, but can retrieve data inside of it
  - mapped function calls on it will not run until data retrieved from inside it!
  - calling code that gets data (`.<valueName> function`) will become impure!

Task = container use for async tasks = IO but async
  - mapped function calls on it will only run when callback made!
  - calling code that gets data (`fork()` function) will become impure!
  - `fork()` will take 2 argument functions, 1st = error function, 2nd = result function

Will cover later:
- calling function with multiple functor arguments
- order sequence of impure or async actions

NEXT CHAPER: Monads!