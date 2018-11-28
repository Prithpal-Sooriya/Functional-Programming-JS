# Container Theory

functors come from category theory and satisfy few laws.

Here are some laws:

```js
// identity
map(id) === id

// composition
compose(map(f), map(g)) === map(compose(f, g));
```

- Identity law = function that will return what is given (**important!**)
- Composition law = simplifying composing and mapping.

```js
const idLaw1 = map(id);
const idLaw2 = id;

//proof to show equality
idLaw1(Container.of(2)); //return Container(2)
idLaw2(Container.of(2)); //return Container(2)

const compLaw1 = compose(map(concat(' world')), map(concat(' cruel')));
const compLaw2 = map(compose(concat(' world'), concat(' cruel')));

//proof to show equality
compLaw1(Container.of('Goodbye')); //return Container(' world cruelGoodbye')
compLaw2(Container.of('Goodbye')); //return Container(' world cruelGoodbye')
```

In category theory, functors take objects and morphisms of a category and map then to a different category
  - functors map categories to other categories.
  - new category **MUST** have identity and ability to compose morphisms. (no need to check, as long as laws above are preserved.)

Functors that map categories together must not change object itself/order of data, but can change values of objects/data

`Maybe` maps **category of types and functions** to a **category where each object may not exist** and each morphism has a `null` check.
  - done in code by surrounding each function with a map, and each type with a functor.

`Endofunctor` = functor maps to a subcategory of types and functions.

```
         f
     a -----> b
     |        |
F.of |        | F.of
     | map(f) | 
     v -----> v
    F a      F b
```
- Different routes mean different behaviour, but always end at same type.

code example

```js
// topRoute :: String -> Maybe String
const topRoute = compose(Maybe.of, reverse);

// bottomRoute :: String -> Maybe String
const bottomRoute = compose(map(reverse), Maybe.of);

topRoute('hi'); //return Just('ih')
bottomRoute('hi'); //return Just('ih')
```

This property allows refractoring of code, based on properties all functors hold (e.g. map!)

Functors can stack
```js
const nested = Task.of([Either.of('pillows'), left('no sleep for you')]);

//map(map(..)) as we have to go through Functors Task and Either
//inner most map to run function we want.
map(map(map(toUpperCase)), nested);
//return Task([Right('PILLOWS'), left('no sleep for you')])
```
- `nested` is a future array with elements that may contain errors.
  - `map` to peel back each layer and run function on elements.
  - no callbacks, no if/else, no loops, just explicit/declaritive context.
- have to `map(map(map(f))), **instead compose functors and call 1 map!**.

```js
class Compose {
  constructor(fgx) {
    this.getCompose = fgx;
  }

  static of(fgx) {
    return new Compose(fgx);
  }

  map(fn) {
    return new Compose(map(map(fn), this.getCompose));
  }
}

const tmd = Task.of(Maybe.of(', rock on, Chicago'));

const ctmd = Compose.of(tmd);

map(concat('Rock over London'), ctmd);
//returns: Compose(Task(Just('Rock over London, rock on, chicago)))

ctmd.getCompose;
//returns:Task(Just('Rock over London, rock on, chicago))
```

`Functor` composition is associative.
- `Container` is actually called `Identity` functor.
- if we have `Identity` and associative composition, we have `category`.
- This `category` has categories as objects, and functors as morphisms.