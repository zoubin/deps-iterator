var assert = require('assert');
var Iter = require('..');

describe('deps walker', function () {
    it('single record', function () {
        var records = [
            { id: 0, deps: [] }
        ];
        var walker = Iter(records);
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 0, deps: [] }
        });
        assert.deepEqual(walker.next(), {
            done: true,
            value: undefined
        });
    });
    it('two records, one missing', function () {
        var records = [
            { id: 0, deps: [1] }
        ];
        var walker = Iter(records);
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 0, deps: [1] }
        });
        assert.deepEqual(walker.next(), {
            done: true,
            value: undefined
        });
    });
    it('two records', function () {
        var records = [
            { id: 0, deps: [1] },
            { id: 1, deps: [] }
        ];
        var walker = Iter(records);
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 1, deps: [] }
        });
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 0, deps: [1] }
        });
        assert.deepEqual(walker.next(), {
            done: true,
            value: undefined
        });
    });
    it('three records', function () {
        var records = [
            { id: 0, deps: [1] },
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
            value: { id: 1, deps: [2] }
        });
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 0, deps: [1] }
        });
        assert.deepEqual(walker.next(), {
            done: true,
            value: undefined
        });
    });
    it('three records, parent and children', function () {
        var records = [
            { id: 0, deps: [1, 2] },
            { id: 1, deps: [] },
            { id: 2, deps: [] }
        ];
        var walker = Iter(records);
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 1, deps: [] }
        });
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 2, deps: [] }
        });
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 0, deps: [1, 2] }
        });
        assert.deepEqual(walker.next(), {
            done: true,
            value: undefined
        });
    });
    it('two trees', function () {
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
    });
    it('cycle', function () {
        var records = [
            { id: 0, deps: [0] }
        ];
        var walker = Iter(records);
        assert.deepEqual(walker.next().cycle, ['0', '0']);
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 0, deps: [0] }
        });
        assert.deepEqual(walker.next(), {
            done: true,
            value: undefined
        });
    });
    it('two seperated cycles', function () {
        var records = [
            { id: 0, deps: [0] },
            { id: 1, deps: [1] }
        ];
        var walker = Iter(records);
        assert.deepEqual(walker.next().cycle, ['0', '0']);
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 0, deps: [0] }
        });
        assert.deepEqual(walker.next().cycle, ['1', '1']);
        assert.deepEqual(walker.next(), {
            done: false,
            value: { id: 1, deps: [1] }
        });
        assert.deepEqual(walker.next(), {
            done: true,
            value: undefined
        });
    });
    it('1 root, 2 cycles', function () {
        var records = [
            { id: 0, deps: [1] },
            { id: 1, deps: [2] },
            { id: 2, deps: [0, 3] },
            { id: 3, deps: [4] },
            { id: 4, deps: [2] }
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
            done: true,
            value: undefined
        });
    });
    it('2 roots, 2 cycles', function () {
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
    });
});
