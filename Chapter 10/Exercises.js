const R = require('ramda');
// const M = require('monet');
// const Maybe = require('folktale/maybe');

// for some reason Ramda, Monnet and Require aren't working well together for ap...
// will just use ramda inbuilt and use arrays as containers

/* Task 1 */
// write a function that adds 2 possible null numbers together using 'Maybe' and 'ap'


// safeAdd :: Maybe Number -> Maybe Number -> Maybe Number
// const safeAdd = R.curry((a, b) =>M.Maybe.of(R.add).ap(a).ap(b));
// const safeAdd = R.curry((a, b) => M.Some(R.add).ap(a).ap(b));
// console.log(safeAdd(M.Maybe.of(1), M.Maybe.of(2)));
const safeAdd1 = (a, b) => R.ap([R.add(a)], b);
console.log(safeAdd1([1], [2]));


/* Task 2 */
// rewrite safeAdd from above to use liftA2
const safeAdd = R.lift(R.add)
console.log(safeAdd([1], [2]));

/* Task 3 */
