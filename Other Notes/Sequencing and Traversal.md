# Sequencing and Traversal
From knowledge found through various browsings through the internet

-----

- problem that can occure is want to `map` every element in a Monadic function `a -> M<'b>`
  - this returns `List<M<'a>>` but often want `M<List<'a>>`

- another example is want to turn list of strings into integers
  - could try parseInt (`String -> option<int>`), but when mapped with `List<String>` will get `<List<option<int>>>` back
    - sometimes this is what we want, but usually want an whole list or nothing `option<List<int>>`

- Could write custom functions every time this occurs, or use a genralisational function: `sequence` and `traverse`

## Sequence

Lets take String list to int list example. Will want to:
1. parse every `String` to an `int`
2. if all inputs are valid, want to `sum` the results
3. if one input is invalid, want to print an error message.

`1.` is easy, just a mapping, `2.` is more tricky 
- could `fold` (`foldLeft` or `foldRight` function) with stating `bool = true` and as soon as encounter `none` then set to false.
  - but already have `option`, that already has inbuilt property for true `Some` and false `None`
    - so ideally `option<List<int>>`.

because of option, can use `list.foldBack`
1. want `option<list<'a>` for result, so start with `Some[]`
2. check if `acc` and `x` are both `Some`
3. if thats the case, add `x` to `acc`
4. else return `None`

**This is called sequence --> foldBack/foldRight on monoid**
- give monad/applicative (pointed), and other type
  - `foldRight`
  - create `acc`/accumulator with starting seed (usually empty list)
    - get current value `f(g(x))` and swap `f` and `g` with pointed --> g.of(f.of(x))
  - return `acc`

## traverse

Traverse is the same as sequence, but will map over an applicative/functor then will sequence over
- even when using sequence, there is 1 pattern that will always be the same -> map applicative and the sequence it.
  - so just combine these operations.

- traverse is basically a `map` for monadic functions, that also swaps the layer when it finishes.

**l.traverse(f) == l.map(f).sequence**