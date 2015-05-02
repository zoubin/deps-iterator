# deps-iterator
Iterator for walking dependency graph. Cycles will be detected.

## Install

```
npm install --save deps-iterator
```

## Usage

```
var Iter = require('deps-iterator');
var walker = Iter(records, opts);

```

* `records`: *Array*. Each element contains a node and its dependencies.
* `opts`: *Object*. Optional.

    * `key`: which field of the record is the key. ('id')
    * `deps`: which field of the record contains the deps. ('deps')

## Examples

### Without cycles

```
var Iter = require('deps-iterator');
var records = [
    { id: 0, deps: [2] },
    { id: 1, deps: [2] },
    { id: 2, deps: [] }
];
var walker = Iter(records);
assert.deepEqual(walker.next(), {
    done: false,
    value: { id: 2, deps: [] }
});
assert.deepEqual(walker.next(), {
    done: false,
    value: { id: 0, deps: [2] }
});
assert.deepEqual(walker.next(), {
    done: false,
    value: { id: 1, deps: [2] }
});
assert.deepEqual(walker.next(), {
    done: true,
    value: undefined
});

```

### With cycles

```
var Iter = require('deps-iterator');
var records = [
    { id: 0, deps: [1] },
    { id: 1, deps: [2] },
    { id: 2, deps: [0, 3] },
    { id: 3, deps: [4] },
    { id: 4, deps: [2] },
    { id: 5, deps: [3] }
];
var walker = Iter(records);
assert.deepEqual(walker.next().cycle, ['0', '1', '2', '0']);
assert.deepEqual(walker.next().cycle, ['2', '3', '4', '2']);
assert.deepEqual(walker.next(), {
    done: false,
    value: { id: 4, deps: [2] }
});
assert.deepEqual(walker.next(), {
    done: false,
    value: { id: 3, deps: [4] }
});
assert.deepEqual(walker.next(), {
    done: false,
    value: { id: 2, deps: [0, 3] }
});
assert.deepEqual(walker.next(), {
    done: false,
    value: { id: 1, deps: [2] }
});
assert.deepEqual(walker.next(), {
    done: false,
    value: { id: 0, deps: [1] }
});
assert.deepEqual(walker.next(), {
    done: false,
    value: { id: 5, deps: [3] }
});
assert.deepEqual(walker.next(), {
    done: true,
    value: undefined
});
```
