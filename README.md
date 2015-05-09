# deps-iterator
Iterator for walking dependency graph. Cycles will be detected.

## Usage

```
var Deps = require('deps-iterator');
var iter = Deps(records, opts);

```

* `records`: *Array*. Each element contains a node and its dependencies.
* `opts`: *Object*. Optional.

    * `key`: which field of the record is the key. ('id')
    * `deps`: which field of the record contains the deps. ('deps')
    * `keepDepsOrder`: *Boolean*. If `true`, the order of `deps` matters.(true)

* `iter`: `Iterable` used to walk the dependency graph

## Examples

**for..of keepDepsOrder:false**

```javascript
var Deps = require('deps-iterator');
var records = [
    { id: 0, deps: [1, 2] },
    { id: 1, deps: [] },
    { id: 2, deps: [3] },
    { id: 3, deps: [] },
    { id: 4, deps: [5, 3] },
    { id: 5, deps: [3] }
];
var iter = Deps(records, { keepDepsOrder: false });
var ordered = [];
for (var node of iter) {
    ordered.push(node);
}
console.log('ordered:');
console.log(ordered);

```

output:

```
⌘ node examples/no-cycle.js
ordered:
[ { id: 1, deps: [] },
  { id: 3, deps: [] },
  { id: 2, deps: [ 3 ] },
  { id: 0, deps: [ 1, 2 ] },
  { id: 5, deps: [ 3 ] },
  { id: 4, deps: [ 5, 3 ] } ]

```

**for..of keepDepsOrder:true**

```javascript
var Deps = require('deps-iterator');
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

```

output:

```
⌘ node examples/keepDepsOrder.js
ordered:
[ { id: 1, deps: [] },
  { id: 5, deps: [ 3 ] },
  { id: 3, deps: [] },
  { id: 2, deps: [ 3 ] },
  { id: 0, deps: [ 1, 2 ] },
  { id: 4, deps: [ 5, 3 ] } ]

```
