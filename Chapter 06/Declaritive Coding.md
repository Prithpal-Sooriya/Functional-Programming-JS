# Declaritive Coding
**Where only use higher order functions and not writing step by step instructions (imperitive)**
- for low level (like managing index's of collections) use imperitive.
- for higher level (like loop through collections) just use declaritive (like MySQL) --> this is what functional programming is!

```js
// imperative
const makes = [];
for (let i = 0; i < cars.length; i += 1) {
  makes.push(cars[i].make);
}

// declarative
const makes = cars.map(car => car.make);

// imperative
const authenticate = (form) => {
  const user = toUser(form);
  return logIn(user);
};

// declarative
const authenticate = compose(logIn, toUser);
```

## functional programming application structure.
- try to seperate impure functions (that can cause side effects) and pure functions.
  - can store impure functions in an object (seperates them)

- start with basic functions, then start refractoring and seperating functions into variable for readability.
```js
  // map's composition law
  compose(map(f), map(g)) === map(compose(f, g));

  /*
  compose(map(f), map(g)) === map(compose(f, g));
  compose(map(img), map(mediaUrl)) === map(compose(img, mediaUrl));
  */
```
