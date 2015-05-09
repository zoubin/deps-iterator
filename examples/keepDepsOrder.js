var Deps = require('..');
var records = [
    { id: 0, deps: [1, 2] },
    { id: 1, deps: [] },
    { id: 2, deps: [3] },
    { id: 3, deps: [] },
    { id: 4, deps: [5, 3] },
    { id: 5, deps: [3] }
];
var iter = Deps(records);
var ordered = [];
for (var node of iter) {
    ordered.push(node);
}
console.log('ordered:');
console.log(ordered);
