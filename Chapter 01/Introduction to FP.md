# Introduction to FP Notes.

Generic Programming principles:
- DRY (Don't Repeat Yourself)
- YAGNI (Ya Ain't Gonna Need It)

knowledge of the ancients:
```JavaScript
// associative
add(add(x, y), z) === add(x, add(y, z));
// (x + y) + z === x + (y + z)

// commutative
add(x, y) === add(y, x);
// (x + y) === (y + x)

// identity
add(x, 0) === x;
// x + 0 === x

// distributive
multiply(x, add(y,z)) === add(multiply(x, y), multiply(x, z));
// x * (y + z) === (x * y) + (x * z)
```

