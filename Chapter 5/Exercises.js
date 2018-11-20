const R = require('ramda');
//same as es6 import
//import { compose, prop, last, map, flip, concat, sortBy } from 'ramda';

const Car = {
    name: 'Aston Martin One-77',
    horsepower: 750,
    dollar_value: 1850000,
    in_stock: true,
};

//Use `compose()` to rewrite the function below.
// isLastInStock :: [Car] -> Boolean
/*
const isLastInStock = (cars) => {
    const lastCar = last(cars);
    return prop('in_stock', lastCar);
};
*/
const isLastInStock = R.compose(R.prop('in_stock'), R.last);

//Considering the following function:
const average = xs => reduce(add, 0, xs) / xs.length;
// Use the helper function `average` to refactor 'averageDollarValue` as a composition.
// averageDollarValue :: [Car] -> Int
/*
const averageDollarValue = (cars) => {
    const dollarValues = map(c => c.dollar_value, cars);
    return average(dollarValues);
};
*/
const averageDollarValue = R.compose(average, R.map(R.prop('dollar_value')));
//R.prop returns a function that (when supplied) returns the indicated property of that object.

//Refactor `fastestCar` using `compose()` and other functions in pointfree-style. Hint, the `flip` function may come in handy
// fastestCar :: [Car] -> String
/*
const fastestCar = (cars) => {
  const sorted = sortBy(car => car.horsepower, cars);
  const fastest = last(sorted);
  return concat(fastest.name, ' is the fastest');
};
*/
const append = R.flip(R.concat);
//R.flip, first 2 params are reversed, R.concat, concat a string array
const fastestCar = R.compose(
    append(' is the fastest'), //append(' is the fastest', name) (thus reverse then concatenated)
    R.prop('name'), //get the name of last
    R.last, //then get the last (most horsepower)
    R.sortBy(R.prop('horsepower')) //first sort by horsepower
);