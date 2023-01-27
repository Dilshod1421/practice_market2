const http = require('http');
const jwt = require('jsonwebtoken');
const { remove } = require('lodash');
const { read_file, write_file } = require('./api/fsRead');
require('dotenv').config();
const port = process.env.PORT || 6789;
const key_jwt = process.env.SECRET_KEY
const options = { "Content-Type": "application/json" };
let admin = read_file('admin.json');
let markets = read_file('markets.json');
let branches = read_file('branches.json');
let workers = read_file('workers.json');
let products = read_file('products.json');
function checkToken(req, res, value) {
    try {
        jwt.verify(req.headers.authorization, key_jwt);
        res.end(JSON.stringify(value));
    } catch {
        return res.end(JSON.stringify("Tokenda muammo!"));
    }
};
function checkPost(req, res) {
    try {
        jwt.verify(req.headers.authorization, key_jwt);
    } catch {
        return res.end(JSON.stringify("Tokenda muammo!"));
    }
}

const server = http.createServer((req, res) => {
    let id = req.url.split('/')[2];
    res.writeHead(200, options);

    //=========================== POST-LOGIN =====================================
    if (req.method === 'POST') {
        if (req.url === '/login') {
            req.on('data', (data) => {
                data = JSON.parse(data);
                if (admin[0].name != data.name || admin[0].password != data.password) {
                    return res.end(JSON.stringify("Wrong name or password"));
                };
                let get_token = jwt.sign({ name: data.name }, key_jwt, { expiresIn: '2h' });
                let token = jwt.verify(get_token, key_jwt);
                if (token.name == admin[0].name) {
                    res.end(JSON.stringify(get_token));
                }
            });
        };
    };


    //========================= GET =======================================
    if (req.method === 'GET') {
        branches.forEach((b) => {
            let addW = [];
            workers.forEach((w) => {
                if (w.branchId == b.branchId) {
                    addW.push(w);
                }
            })
            b.workers = addW;
            let addP = [];
            products.forEach((p) => {
                if (b.branchId == p.branchId) {
                    addP.push(p);
                }
            })
            b.products = addP;
        });

        markets.forEach((m) => {
            let addB = [];
            branches.forEach((br) => {
                if (br.marketId == m.marketId) {
                    if (req.url === '/markets') {
                        delete br.workers;
                        delete br.products;
                    }
                    addB.push(br);
                }
            })
            m.branches = addB;
        });

        if (req.url === '/markets') {
            checkToken(req, res, markets);
        };

        if (req.url === `/markets/${id}`) {
            let market;
            markets.forEach(m => {
                if (m.marketId == id) {
                    market = m;
                    return;
                }
            });
            checkToken(req, res, market);
        };

        if (req.url === '/branches') {
            checkToken(req, res, branches);
        };

        if (req.url === `/branches/${id}`) {
            let branch = branches.find(b => b.branchId == id);
            checkToken(req, res, branch);
        };

        if (req.url === '/workers') {
            checkToken(req, res, workers);
        };

        if (req.url === `/workers/${id}`) {
            let worker = workers.find(w => w.id == id)
            checkToken(req, res, worker);
        };

        if (req.url === '/products') {
            checkToken(req, res, products);
        };

        if (req.url === `/products/${id}`) {
            let product = products.find(p => p.id == id);
            checkToken(req, res, product);
        };

    };


    if (req.method === 'POST') {
        if (req.url === '/markets') {
            checkPost(req, res);
            req.on('data', data => {
                let markets2 = read_file('markets.json');
                markets2.push({ marketId: markets2[markets2.length - 1].marketId + 1, ...JSON.parse(data) });
                write_file('markets.json', markets2);
                return res.end(JSON.stringify(markets2));
            })
        };

        if (req.url === '/branches') {
            checkPost(req, res);
            req.on('data', data => {
                let branches2 = read_file('branches.json');
                branches2.push({ branchId: branches2[branches2.length - 1].branchId + 1, ...JSON.parse(data) });
                write_file('branches.json', branches2);
                return res.end(JSON.stringify(branches2));
            })
        };

        if (req.url === '/workers') {
            checkPost(req, res);
            req.on('data', data => {
                workers.push({ id: workers[workers.length - 1].id + 1, ...JSON.parse(data) });
                write_file('workers.json', workers);
                return res.end(JSON.stringify(workers));
            })
        };

        if (req.url === '/products') {
            checkPost(req, res);
            req.on('data', data => {
                products.push({ id: products[products.length - 1].id + 1, ...JSON.parse(data) });
                write_file('products.json', products);
                return res.end(JSON.stringify(products));
            })
        };
    };


    if (req.method === 'PUT') {
        if (req.url === `/markets/${id}`) {
            checkPost(req, res);
            req.on('data', data => {
                let info = JSON.parse(data);
                markets.forEach(market => {
                    if (market.marketId == id) {
                        market.name = info.name || market.name;
                    };
                });
                write_file("markets.json", markets);
                return res.end(JSON.stringify(markets));
            });
        };

        if (req.url === `/branches/${id}`) {
            checkPost(req, res);
            req.on('data', data => {
                let info = JSON.parse(data);
                branches.forEach(branch => {
                    if (branch.branchId == id) {
                        branch.name = info.name || branch.name;
                        branch.address = info.name || branch.address,
                            branch.marketId = info.marketId || branch.marketId;
                    }
                });
                write_file("branches.json", branches);
                return res.end(JSON.stringify(branches));
            });
        };

        if (req.url === `/workers/${id}`) {
            checkPost(req, res);
            req.on('data', data => {
                let info = JSON.parse(data);
                workers.forEach(worker => {
                    if (worker.id == id) {
                        worker.name = info.name || worker.name,
                            worker.phoneNumber = info.phoneNumber || worker.phoneNumber,
                            worker.branchId = info.branchId || worker.branchId;
                    };
                });
                write_file("workers.json", workers);
                return res.end(JSON.stringify(workers));
            });
        };

        if (req.url === `/products/${id}`) {
            checkPost(req, res);
            req.on('data', data => {
                let info = JSON.parse(data);
                products.forEach(product => {
                    if (product.id == id) {
                        product.name = info.name || product.name,
                            product.phoneNumber = info.phoneNumber || product.phoneNumber,
                            product.branchId = info.branchId || product.branchId;
                    };
                });
                write_file("products.json", products);
                return res.end(JSON.stringify(products));
            });
        };
    };


    if (req.method === 'DELETE') {
        if (req.url === `/markets/${id}`) {
            checkPost(req, res);
            markets.forEach((market, index) => {
                if (market.marketId == id) {
                    markets.splice(index, 1);
                }
            });
            write_file("markets.json", markets);
            return res.end(JSON.stringify(markets));
        };

        if (req.url === `/branches/${id}`) {
            checkPost(req, res);
            branches.forEach((branch, index) => {
                if (branch.branchId == id) {
                    branches.splice(index, 1);
                }
            });
            write_file("branches.json", branches);
            return res.end(JSON.stringify(branches));
        };

        if (req.url === `/workers/${id}`) {
            checkPost(req, res);
            workers.forEach((worker, index) => {
                if (worker.id == id) {
                    workers.splice(index, 1);
                }
            });
            write_file("workers.json", workers);
            return res.end(JSON.stringify(workers));
        };

        if (req.url === `/products/${id}`) {
            checkPost(req, res);
            products.forEach((product, index) => {
                if (product.id == id) {
                    products.splice(index, 1);
                }
            });
            write_file("products.json", products);
            return res.end(JSON.stringify(products));
        };
    };
});

server.listen(port, (err) => {
    if (err) throw err;
    console.log('server listening on port ' + port);
})