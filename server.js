const http = require('http');
const { read_file, write_file } = require('./api/fsRead');
require('dotenv').config();
const port = process.env.PORT || 6789;
const options = { "Content-Type": "application/json" };

const server = http.createServer((req, res) => {
    res.writeHead(200, options);
});

server.listen(port, (err) => {
    if (err) throw err;
    console.log('server listening on port' + port);
})