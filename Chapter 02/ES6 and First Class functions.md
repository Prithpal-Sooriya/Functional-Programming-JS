# Chapter 2 notes

## ES6+ create functions
```js
const hi = name => `Hi ${name}`;
/*
//same as
function hi(name) {
    return 'Hi ' + name;
}
*/

//this function uses another function and uses it. => redundant, just wraps greeting for no reason.
const greeting = name => hi(name);

hi; // name => `Hi ${name}`
hi("jonas"); // "Hi jonas"

const greeting = hi;
greeting("times"); // "Hi times"
```

- No point wrapping a function if it already does its stuff!!

```js
// ignorant
const getServerStuff = callback => ajaxCall(json => callback(json));

// enlightened
const getServerStuff = ajaxCall;

// this line
ajaxCall(json => callback(json));

// is the same as this line
ajaxCall(callback);

// so refactor getServerStuff
const getServerStuff = callback => ajaxCall(callback);

// ...which is equivalent to this
const getServerStuff = ajaxCall; // <-- look mum, no ()'s
```

- Same for objects
```js
const BlogController = {
  index(posts) { return Views.index(posts); },
  show(post) { return Views.show(post); },
  create(attrs) { return Db.create(attrs); },
  update(post, attrs) { return Db.update(post, attrs); },
  destroy(post) { return Db.destroy(post); },
};
//same as
const BlogController = {
  index: Views.index,
  show: Views.show,
  create: Db.create,
  update: Db.update,
  destroy: Db.destroy,
};
```

-----

# why favour first class functions
- no unneeded wrapping of functions (shown above).

- easier to handle changes e.g. if there is an error, you may not need to add err parameter!
    - `httpGet('/post/2', (json, err) => renderPost(json, err));` vs `httpGet('/post/2', renderPost);`

- can make code more generic and can be used in other projects/parts of codebase
    - `const validArticles = articles =>
  articles.filter(article => article !== null && article !== undefined)`
  vs `const compact = xs => xs.filter(x => x !== null && x !== undefined);`

- less abstractions (e.g. `this` object issues and instead use `bind` to avoid those issues)

