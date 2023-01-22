const http = require('http');
const jwt = require('jsonwebtoken');
const { read_file, write_file } = require('./api/fsRead');
require('dotenv').config();
const port = process.env.PORT || 6789;
const key_jwt = process.env.SECRET_KEY
const options = { "Content-Type": "application/json" };

const server = http.createServer((req, res) => {
    let admin = read_file('admin.json');
    res.writeHead(200, options);
    if (req.method === 'POST') {
        if (req.url === '/login') {
            req.on('data', (data) => {
                data = JSON.parse(data);
                if (admin[0].name != data.name || admin[0].password != data.password) {
                    return res.end(JSON.stringify("Wrong name or password"));
                };
                let token = jwt.sign({ ...data }, key_jwt, { expiresIn: '10h' });
                res.end(JSON.stringify(token));
            });
        }
    }
});

server.listen(port, (err) => {
    if (err) throw err;
    console.log('server listening on port ' + port);
})