var test = require('tape');
var Deps = require('..');

test('single record', function (t) {
    var records = [
        { id: 0, deps: [] }
    ];
    var iter = Deps(records);
    var ordered = walk(iter);
    t.deepEqual(ordered, [
        { id: 0, deps: [] }
    ]);
    t.end();
});
test('two records, one missing', function (t) {
    var records = [
        { id: 0, deps: [1] }
    ];
    var iter = Deps(records);
    var ordered = walk(iter);
    t.deepEqual(ordered, [
        { id: 0, deps: [1] }
    ]);
    t.end();
});
test('two records', function (t) {
    var records = [
        { id: 0, deps: [1] },
        { id: 1, deps: [] }
    ];
    var iter = Deps(records);
    var ordered = walk(iter);
    t.deepEqual(ordered, [
        { id: 1, deps: [] },
        { id: 0, deps: [1] }
    ]);
    t.end();
});
test('three records', function (t) {
    var records = [
        { id: 0, deps: [1] },
        { id: 1, deps: [2] },
        { id: 2, deps: [] }
    ];
    var iter = Deps(records);
    var ordered = walk(iter);
    t.deepEqual(ordered, [
        { id: 2, deps: [] },
        { id: 1, deps: [2] },
        { id: 0, deps: [1] }
    ]);
    t.end();
});
test('three records, parent and children', function (t) {
    var records = [
        { id: 0, deps: [1, 2] },
        { id: 1, deps: [] },
        { id: 2, deps: [] }
    ];
    var iter = Deps(records);
    var ordered = walk(iter);
    t.deepEqual(ordered, [
        { id: 1, deps: [] },
        { id: 2, deps: [] },
        { id: 0, deps: [1, 2] }
    ]);
    t.end();
});
test('two trees', function (t) {
    var records = [
        { id: 0, deps: [2] },
        { id: 1, deps: [2] },
        { id: 2, deps: [] }
    ];
    var iter = Deps(records);
    var ordered = walk(iter);
    t.deepEqual(ordered, [
        { id: 2, deps: [] },
        { id: 0, deps: [2] },
        { id: 1, deps: [2] }
    ]);
    t.end();
});
test('cycle', function (t) {
    t.plan(2);
    var records = [
        { id: 0, deps: [0] }
    ];
    var iter = Deps(records);
    iter.on('cycle', function (cycle) {
        t.deepEqual(cycle, ['0', '0']);
        t.deepEqual(ordered, [
            { id: 0, deps: [0] }
        ]);
    });
    var ordered = walk(iter);
});
test('two seperated cycles', function (t) {
    t.plan(3);
    var records = [
        { id: 0, deps: [0] },
        { id: 1, deps: [1] }
    ];
    var iter = Deps(records);
    var first = true;
    iter.on('cycle', function (cycle) {
        if (first) {
            t.deepEqual(cycle, ['0', '0']);
            first = false;
        } else {
            t.deepEqual(cycle, ['1', '1']);
            t.deepEqual(ordered, [
                { id: 0, deps: [0] },
                { id: 1, deps: [1] }
            ]);
        }
    });
    var ordered = walk(iter);
});
test('1 root, 2 cycles', function (t) {
    t.plan(3);
    var records = [
        { id: 0, deps: [1] },
        { id: 1, deps: [2] },
        { id: 2, deps: [0, 3] },
        { id: 3, deps: [4] },
        { id: 4, deps: [2] }
    ];
    var iter = Deps(records, { keepDepsOrder: false });
    var first = true;
    iter.on('cycle', function (cycle) {
        if (first) {
            t.deepEqual(cycle, ['0', '1', '2', '0']);
            first = false;
        } else {
            t.deepEqual(cycle, ['2', '3', '4', '2']);
            t.deepEqual(ordered, [
                { id: 4, deps: [2] },
                { id: 3, deps: [4] },
                { id: 2, deps: [0, 3] },
                { id: 1, deps: [2] },
                { id: 0, deps: [1] }
            ]);
        }
    });
    var ordered = walk(iter);
});
test('2 roots, 2 cycles', function (t) {
    t.plan(3);
    var records = [
        { id: 0, deps: [1] },
        { id: 1, deps: [2] },
        { id: 2, deps: [0, 3] },
        { id: 3, deps: [4] },
        { id: 4, deps: [2] },
        { id: 5, deps: [3] }
    ];
    var iter = Deps(records, { keepDepsOrder: false });
    var first = true;
    iter.on('cycle', function (cycle) {
        if (first) {
            t.deepEqual(cycle, ['0', '1', '2', '0']);
            first = false;
        } else {
            t.deepEqual(cycle, ['2', '3', '4', '2']);
            t.deepEqual(ordered, [
                { id: 4, deps: [2] },
                { id: 3, deps: [4] },
                { id: 2, deps: [0, 3] },
                { id: 1, deps: [2] },
                { id: 0, deps: [1] },
                { id: 5, deps: [3] }
            ]);
        }
    });
    var ordered = walk(iter);
});
test('.deps is Function', function (t) {
    var records = [
        { id: 0, deps: { 1: true, 2: true } },
        { id: 1, deps: {} },
        { id: 2, deps: {} }
    ];
    var iter = Deps(records, { deps: function (rec) { return Object.keys(rec.deps); } });
    var ordered = walk(iter);
    t.deepEqual(ordered, [
        { id: 1, deps: {} },
        { id: 2, deps: {} },
        { id: 0, deps: { 1: true, 2: true } }
    ]);
    t.end();
});

function walk(iter) {
    var ordered = [];
    for (var node of iter) {
        ordered.push(node);
    }
    return ordered;
}
