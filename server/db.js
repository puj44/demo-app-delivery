const pg = require('pg');
const db = new pg.Client(process.env.NODE_ENV_CONNECTION_STRING);

db.connect(function (err) {
    if (err) {
        return console.error('could not connect to postgres', err);
    }
    db.query('SELECT NOW() AS "theTime"', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }
    });

});

module.exports = db;