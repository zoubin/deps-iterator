# deps-iterator
Iterator for walking dependency graph. Cycles will be detected.

## Usage

```
var Deps = require('deps-iterator');
var iter = Deps(records, opts);

```

* `records`: *Array*. Each element contains a node and its dependencies.
* `opts`: *Object*. Optional.

    * `key`: *String*. way to get the key. ('id')
    * `deps`: *String* | *Function*. way to get the deps. ('deps')
    * `keepDepsOrder`: *Boolean*. If `true`, the order of `deps` matters.(true)

* `iter`: `Iterable` used to walk the dependency graph

### for (var node of iter)

### iter.on('cycle', cb)
See example below.

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

**.on('cycle', cb)**

```javascript
var Deps = require('deps-iterator');
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

```

output:

```
⌘ node examples/cycle.js
ordered:
[ { id: 4, deps: [ 2 ] },
  { id: 3, deps: [ 4 ] },
  { id: 2, deps: [ 0, 3 ] },
  { id: 1, deps: [ 2 ] },
  { id: 0, deps: [ 1 ] },
  { id: 5, deps: [ 3 ] } ]
cycle: [ '0', '1', '2', '0' ]
cycle: [ '2', '3', '4', '2' ]

```

**various deps**

```javascript
var JSONStream = require('JSONStream');
var rs = require('stream').Readable({ objectMode: true });

var Deps = require('..');
var records = [
    {
        id: './entry.css',
        deps: {
            './deps/a.css': '/Users/zoubin/example/deps/a.css',
            './deps/b.css': '/Users/zoubin/example/deps/b.css'
        }
    },
    { id: '/Users/zoubin/example/deps/b.css', deps: {} },
    { id: '/Users/zoubin/example/deps/a.css', deps: {} }
];
var iter = Deps(records, {
    deps: function (rec) {
        return Object.keys(rec.deps).map(function (d) { return rec.deps[d]; });
    }
});

for (var node of iter) {
    rs.push(node);
}
rs.push(null);
rs.pipe(JSONStream.stringify()).pipe(process.stdout);

```

output:

```
⌘ node examples/deps.js
[
{"id":"/Users/zoubin/example/deps/a.css","deps":{}}
,
{"id":"/Users/zoubin/example/deps/b.css","deps":{}}
,
{"id":"./entry.css","deps":{"./deps/a.css":"/Users/zoubin/example/deps/a.css","./deps/b.css":"/Users/zoubin/example/deps/b.css"}}
]

```
