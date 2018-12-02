// not runnable...

/* Task 1 */
// given following elements

// httpGet :: Route -> Task Error JSON

// routes :: Map Route Route
const routes = new Map({'/': '/', '/about': '/about'});

// use the traversable interface to change type signatures of 'getJsons' to 'Map Route Route -> Task Error (Map Route JSON)'

// getJsonsOld :: Map Route Route -> Map Route (Task Error JSON)
const getJsonsOld = map(httpGet);

// getJsons :: Map Route Route -> Task Error (Map Route)
const getJsons = traverse(Task.of, httpGet);

/* Task 2 */

// define following validation function

// validate :: Player -> Either String Player
const validate = player => (player.name ? Either.of(player) : left('must have name'));

// using traversable and validate function, update 'startGame' (and its signature) to only start game if player if valid

// startGameOld :: [Player] -> [Either Error String]
const startGameOld = compose(map(always('game started!')), map(validate));

// startGame :: [Player] -> Either Error [String]
const startGame = compose(
  map(always('game started!')),
  traverse(Either.of, validate)
);

/* Task 3 */

// consider some file-system helpers

// readfile :: String -> Task Error String
// readdir :: String -> Task Error [String]

// Use traversable to rearrange and flatten the nested Tasks & Maybe

// readFirstOld :: String -> Task Error (Task Error (Maybe String))
const readFirstOld = compose(map(map(readfile('utf-8'))), map(safeHead), readdir);

// readFirst :: String -> Task Error (Maybe String)
const readFirst = compose(
  chain(traverse(Task.of, readfile('utf-8'))),
  map(safeHead), //Task Error (Maybe String)
  readdir //Task Error [String]
);