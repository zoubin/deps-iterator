var TreeWalker = require('tree-iterator').postOrder;

module.exports = DepsIterator;

function DepsIterator(records, opts) {
    if (!(this instanceof DepsIterator)) {
        return new DepsIterator(records, opts);
    }
    opts = opts || {};
    opts.key = opts.key || 'id';
    opts.deps = opts.deps || 'deps';

    var self = this;
    this.graph = {};
    this.invalid = [];
    this.map = {};
    this.entries = [];
    records.forEach(function (rec) {
        var key = valid(rec[opts.key]);
        if (!key) {
            self.invalid.push(rec);
            return;
        }
        self.map[key] = rec;
        var deps = rec[opts.deps];
        self.graph[key] = deps && deps.map(valid).filter(Boolean) || [];
        self.entries.push(key);
    });
    this.visited = {};
}

DepsIterator.prototype.next = function() {
    if (this.invalid.length) {
        return {
            done: false,
            value: this.invalid.shift()
        };
    }
    if (this.returned) {
        return this.returned;
    }
    var walker = this.getTreeWalker();
    if (!walker) {
        return this.return();
    }
    var res = walker.next();
    if (!res.error) {
        if (!this.map[res.value]) {
            return this.next();
        }
        res.value = this.map[res.value];
    }
    return res;
};

DepsIterator.prototype.return = function (v) {
    this.returned = { done: true, value: v };
    return this.returned;
};

DepsIterator.prototype.throw = function (err) {
    if (typeof err === 'string') {
        err = new Error(err);
    }
    if (!(err instanceof Error)) {
        err = new Error('error throwed');
    }
    throw err;
};

DepsIterator.prototype.getTreeWalker = function() {
    var self = this;
    if (!this.walker || this.walker.returned) {
        var root;
        while (this.entries.length) {
            root = this.entries.shift();
            if (!this.visited[root]) {
                break;
            }
        }
        if (typeof root === 'undefined' || this.visited[root]) {
            return null;
        }
        this.walker = TreeWalker(root, function (id) {
            return self.graph[id];
        }, this.visited);
    }
    return this.walker.returned ? null : this.walker;
};

function valid(k) {
    if (typeof k === 'number') {
        return !isNaN(k) && ('' + k);
    }
    return typeof k === 'string' && k;
}
