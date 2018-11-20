// words :: String -> [String]
const words = str => split(' ', str);
const wordSplitter = split(' '); //partual application version
const sentence = "Hello my name is Prithpal Sooriya";
wordSplitter(sentence);

// filterQs :: [String] -> [String]
const filterQs = xs => filter(x => x.match(/q/i), xs);
const filterQs = filter(match(/q/i)); //parital application
const result = xs => filterQs(xs);


//Considering the following function:
//const keepHighest = (x, y) => (x >= y ? x : y);
// max :: [Number] -> Number
const max = xs => reduce((acc, x) => (x >= acc ? x : acc), -Infinity, xs);

//keepHighest already exists as helper function, so just use it intead.
const max = reduce(keepHighest, -Infinity); //partial application