var Deps = require('..');
var records = [
    { id: 0, deps: [1] },
    { id: 1, deps: [2] },
    { id: 2, deps: [0, 3] },
    { id: 3, deps: [4] },
    { id: 4, deps: [2] },
    { id: 5, deps: [3] }
];
var iter = Deps(records, { keepDepsOrder: false });
iter.on('cycle', function (cycle) {
    console.log('cycle:', cycle);
});
var ordered = [];
for (var node of iter) {
    ordered.push(node);
}
console.log('ordered:');
console.log(ordered);

