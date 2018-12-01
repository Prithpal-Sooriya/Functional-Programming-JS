const R = require('ramda');
const M = require('monet');



// for some reason Ramda, Monnet and Require aren't working well together for ap...
// --> reason was because fantasy-land spec changed how ap works,
//     Stick with this book spec, as its same as other functional languages
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
const safeAdd2 = R.lift(R.add)
console.log(safeAdd2([1], [2]));

const safeAdd3 = M.IO.of((a, b) => a+b).ap(M.IO.of(() => 1)).ap(M.IO.of(() => 3));
console.log(safeAdd3.run());

/* Task 3 */
// have following helper functions
const localStorage = {
  player1: {id: 1, name: 'Prithpal'},
  player2: {id: 2, name: 'Sooriya'}
};

// getFromCache :: String -> IO User
// const getFromCache = x => M.Maybe.of(() => localStorage[x]);
const getFromCache = x => M.Maybe.of(localStorage[x]);
// const getFromCache = x => Task.of(() => localStorage[x]);

// game :: User -> User -> String
// const game = R.curry((p1, p2) => `${p1.name} vs ${p2.name}`);
const game = p1 => p2 => `${p1.name} vs ${p2.name}`;

// write and IO that gets both player1 and player2 from cache and starts the game

const trace = msg => R.tap(x => console.log(msg, x));

// startGame :: IO String
// const startGame = R.lift(M.IO.of(game), [M.IO.of('player1'), M.IO.of('player2')]);
// const startGame = Task.of(game).apply(getFromCache('player1')).apply(getFromCache('player2'));
// console.log(startGame.run())
// const startGame = getFromCache('player1').ap(getFromCache('player2')).ap(M.IO.of(game)).ap(getFromCache('player1')).ap(getFromCache('player2'));
// const startGame = M.IO.of(game).ap(getFromCache('player1')).ap(getFromCache('player2'));
const startGame = (p1, p2) => getFromCache(p2).ap(getFromCache(p1).map(game));
console.log(startGame('player1', 'player2'))

const person = forename => surname => address => `${forename} ${surname} lives in ${address}`
const personString = M.Some(() => 'Dulwich, London')
  .ap(M.Some(() => 'Baker').ap(M.Some(() => 'Tom').map(person)))
  .some()

console.log(personString)

