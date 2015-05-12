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

