# Containers and Asynchronous Tasks

Async tasks usually use callback functions when they complete.
- Callback hell --> when chaining callback to another callback --> messy (nested functions), unreadable, and more error prone.

FP example of handling callbacks: **Task**

```js
/*  Node read file example  */
const fs = require('fs');

// readFile :: String -> Task Error String
const readFile = filename => new Task((reject, result) => {
  fs.readFile(filename, (err, data) => (err ? reject(err) : result(data)));
});

readFile('metamorphosis').map(split('\n')).map(head);
// output: Task('One morning, as Gregor Samsa was waking up from anxious dreams, he discovered that in bed he had been changed into a monstrous verminous bug.'), first paragraph.

/*  jquery getJSON example  */

// getJSON :: String -> {} -> Test Error JSON
const getJSON = curry((url, params) => new Task((reject, result) => {
  $.getJSON(url, params, result).fail(reject);
}));

getJSON('/video', {id: 10}).map(prop('title'));
// output: Task('Family Matters ep 15');

/*  Default Minimal Context  */

// we can put normal, non futuristic calues inside as well
Task.of(3).map(three => three + 1);
// output: Task(4);
```

- `readFile` and `getJSON` will create new `Task`s that will take error and success callbacks `reject` and `result`
  - `Task` is functor, allows mapping to be done easily.
  - Simmilar to Promises, use `map` instead of `then` --> this is more pure than promises.

- `Task` will wait until callback can be executed/waits for our command (simmilar to `IO`)
  - `IO` is subsumed by `Task` for async execution --> `ReadFile` and `getJSON` don't require extra `IO` container to be pure.
- `Task` also works like `IO` where we can `map` over it = placing instructions for the future actions
  - map functions are not ran straight away until data is recieve to it.

To run `Task` must call `fork` method (works same way as `IO` .$value)
  - will fork process and rest of code continues --> non blocking.

Example of `fork` (uses `Handlebars` library instead of `Ramda`)

```js
/*  Pure application  */
// blogPage :: Posts -> HTML
const blogPage = Handlebars.compile(blogTemplate);

// renderPage :: Posts -> HTML
const renderPage = compose(blogPage, sortBy(prop('date')));

// blog :: Params -> Task Error HTML
const blog = compose(map(renderPage), getJSON('/posts'));

/* impure calling code */
//blog can call 'fork' as uses getJSON() which returns a Task.
blog({}).fork(
  error => $('#error').html(error.message),
  page => $('#main').html(page)
);

$('#spinner').show();
```

- when `fork` is called, `Task` will try to find posts ('/posts') and render the page.
  - meanwhile, show the spinner since `fork` does not wait for response.
- finally display error, if getJSON failed; display page if getJSON() succeeded.

code above is easy to read (compared to many "{}" and callback hell)
- just read code from bottom to top and right to left to see execution stack.
- blog({}).fork -> getJSON('/posts') -> sortBy(prop('date')) -> compile(blogTemplate)

`Task` doesn't need `Either` containers, as normal control flow does not work with async commands.
- fine because `Task` handles errors quite well as it is.

Some examples where `IO` and `Either` may work in async flow

```js
// Postgres.connect :: Url -> IO DbConnection
// runQuery :: DbConnection -> ResultSet
// readFile :: String -> Task Error String

/*  Pure application  */

// dbUrl :: Config -> Either Error Url
//returns Either(error)/Left(error) Either(url)
const dbUrl = ({ uname, pass, host, db } => {
  //if these exist
  if(uname && pass && host && db) {
    return Either.of(`db:pg://${uname}:${pass}@${host}5432/${db}`);
  }

  //any of the params do not exist
  return Left(Error('Invalid Config!'));
});

// connectDb :: Config -> Either Error (IO DbConnection)
const connectDb = compose(map(Postgres.connect), dbUrl);

// getConfig :: Filename -> Task Error (Either Error (IO DbConnection))
const getConfig = compose(map(compose(connectDb, JSON.parse)), readFile);

/*  Impure calling code  */

getConfig('db.json').fork(
  logErr("couldn't read file"),
  either(console.log, map(runQuery))
);
```

In example above, use `Either` and `IO` from within success branch of `readFile`.
- `Task` takes care of impurities of reading file asyncronously
- `Either` used for validating config
- `IO` used for handling db connection

In professional grade applications, will have multiple async tasks in one workflow.
- have not covered full container API's to handle this scenario (e.g. monads, etc)