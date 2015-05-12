var TreeIterator = require('tree-iterator');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
inherits(DepsIterator, EventEmitter);

module.exports = DepsIterator;

function DepsIterator(records, opts) {
    if (!(this instanceof DepsIterator)) {
        return new DepsIterator(records, opts);
    }

    opts = defaultOpts(opts);

    this.graph = {};
    this.invalid = [];
    this.map = {};
    this.entries = [];
    var self = this;
    records.forEach(function (rec) {
        var key = valid(rec[opts.key]);
        if (!key) {
            self.invalid.push(rec);
            return;
        }
        self.map[key] = rec;
        var deps = opts.deps(rec);
        deps = deps && deps.map(valid).filter(Boolean) || [];
        self.graph[key] = (self.graph[key] || []).concat(deps);
        if (deps.length && opts.keepDepsOrder) {
            // deps order
            deps.reduce(function (d, k) {
                self.graph[k] = self.graph[k] || [];
                self.graph[k].push(d);
                return k;
            });
        }
        self.entries.push(key);
    });
    Object.keys(this.graph).forEach(function (key) {
        self.graph[key] = Object.keys(self.graph[key].reduce(function (o, k) {
            o[k] = true;
            return o;
        }, {}));
    });
    this.visited = opts.visited;
}

DepsIterator.prototype[Symbol.iterator] = function *() {
    var visited = this.visited || {};
    var entries = this.entries;

    yield * this.invalid;

    for (var i = 0, len = entries.length; i < len; i++) {
        var iter = this.getTreeIterator(entries[i], visited);
        iter.on('cycle', this.emit.bind(this, 'cycle'));
        for (var n of iter) {
            if (this.map[n]) {
                yield this.map[n];
            }
        }
    }
};

DepsIterator.prototype.getTreeIterator = function(entry, visited) {
    var self = this;
    return TreeIterator(entry, function (node) {
        return self.graph[node];
    }, visited);
};

function valid(k) {
    if (typeof k === 'number') {
        return !isNaN(k) && ('' + k);
    }
    return typeof k === 'string' && k;
}

function xtend() {
    var ret = {};
    var args = [].filter.call(arguments, propertier);
    for (var i = 0, len = args.length; i < len; i++) {
        for (var k in args[i]) {
            if (args[i].hasOwnProperty(k)) {
                ret[k] = args[i][k];
            }
        }
    }
    return ret;
}

function propertier(o) {
    return o !== null && typeof o !== 'undefined';
}

function defaultOpts(opts) {
    opts = xtend({
        key: 'id',
        deps: 'deps',
        keepDepsOrder: true
    }, opts);

    if (typeof opts.deps !== 'function') {
        var deps = opts.deps;
        opts.deps = function (rec) {
            return rec[deps];
        };
    }
    return opts;
}
