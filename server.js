const http = require('http');
const jwt = require('jsonwebtoken');
const { resolve } = require('path');
const { kill } = require('process');
const { read_file, write_file } = require('./api/fsRead');
require('dotenv').config();
const port = process.env.PORT || 6789;
const key_jwt = process.env.SECRET_KEY
const options = { "Content-Type": "application/json" };

const server = http.createServer((req, res) => {
    let admin = read_file('admin.json');
    let markets = read_file('markets.json');
    let branches = read_file('branches.json');
    let workers = read_file('workers.json');
    let products = read_file('products.json');
    let id = req.url.split('/')[2];
    res.writeHead(200, options);

    if (req.method === 'POST') {
        if (req.url === '/login') {
            req.on('data', (data) => {
                data = JSON.parse(data);
                if (admin[0].name != data.name || admin[0].password != data.password) {
                    return res.end(JSON.stringify("Wrong name or password"));
                };
                let get_token = jwt.sign({ ...data }, key_jwt, { expiresIn: '10h' });
                res.end(JSON.stringify(get_token));
            });
        };
    };

    try {
        if (jwt.verify(req.headers.authorization, key_jwt)) {
            if (req.method === 'GET') {
                if (req.url === '/workers') {
                    return res.end(JSON.stringify(workers));
                };

                if (req.url === `/workers/${id}`) {
                    return res.end(JSON.stringify(workers.find(w => w.id == id)));
                };

                if (req.url === '/products') {
                    return res.end(JSON.stringify(products));
                };

                if (req.url === `/products/${id}`) {
                    return res.end(JSON.stringify(products.find(p => p.id == id)));
                };

                markets.forEach((m) => {
                    let addB = [];
                    branches.forEach((br) => {
                        if (br.marketId == m.marketId) {
                            delete br.marketId;
                            addB.push(br);
                        }
                    })
                    m.branches = addB;
                });

                if (req.url === '/markets') {
                    return res.end(JSON.stringify(markets));
                };

                branches.forEach((b) => {
                    let addW = [];
                    workers.forEach((w) => {
                        if (w.branchId == b.branchId) {
                            delete w.branchId;
                            addW.push(w);
                        }
                    })
                    b.workers = addW;
                    let addP = [];
                    products.forEach((p) => {
                        if (b.branchId == p.branchId) {
                            delete p.branchId;
                            addP.push(p);
                        }
                    })
                    b.products = addP;
                });

                if (req.url === `/markets/${id}`) {
                    return res.end(JSON.stringify(markets.find(m => m.marketId == id)));
                };

                if (req.url === '/branches') {
                    return res.end(JSON.stringify(branches));
                };

                if (req.url === `/branches/${id}`) {
                    return res.end(JSON.stringify(branches.find(b => b.branchId == id)));
                };
            };


            if (req.method === 'POST') {
                if (req.url === '/markets') {
                    req.on('data', data => {
                        markets.push({ marketId: markets[markets.length - 1].marketId + 1, ...JSON.parse(data) });
                        write_file('markets.json', markets);
                        return res.end(JSON.stringify(markets));
                    })
                };

                if (req.url === '/branches') {
                    req.on('data', data => {
                        branches.push({ branchId: branches[branches.length - 1].branchId + 1, ...JSON.parse(data) });
                        write_file('branches.json', branches);
                        return res.end(JSON.stringify(branches));
                    })
                };

                if (req.url === '/workers') {
                    req.on('data', data => {
                        workers.push({ id: workers[workers.length - 1].id + 1, ...JSON.parse(data) });
                        write_file('workers.json', workers);
                        return res.end(JSON.stringify(workers));
                    })
                };

                if (req.url === '/products') {
                    req.on('data', data => {
                        products.push({ id: products[products.length - 1].id + 1, ...JSON.parse(data) });
                        write_file('products.json', products);
                        return res.end(JSON.stringify(products));
                    })
                };
            };


            if (req.method === 'PUT') {
                if (req.url === `/markets/${id}`) {
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
                    markets.forEach((market, index) => {
                        if (market.marketId == id) {
                            markets.splice(index, 1);
                        }
                    });
                    write_file("markets.json", markets);
                    return res.end(JSON.stringify(markets));
                };

                if (req.url === `/branches/${id}`) {
                    branches.forEach((branch, index) => {
                        if (branch.branchId == id) {
                            branches.splice(index, 1);
                        }
                    });
                    write_file("branches.json", branches);
                    return res.end(JSON.stringify(branches));
                };

                if (req.url === `/workers/${id}`) {
                    workers.forEach((worker, index) => {
                        if (worker.id == id) {
                            workers.splice(index, 1);
                        }
                    });
                    write_file("workers.json", workers);
                    return res.end(JSON.stringify(workers));
                };

                if (req.url === `/products/${id}`) {
                    products.forEach((product, index) => {
                        if (product.id == id) {
                            products.splice(index, 1);
                        }
                    });
                    write_file("products.json", products);
                    return res.end(JSON.stringify(products));
                };
            }
        };
    }
    catch {
        return res.end(JSON.stringify("Kechirasiz, ma'lumotlarni boshqarishga sizga ruxsat berilmaydi!"));
    };
});

server.listen(port, (err) => {
    if (err) throw err;
    console.log('server listening on port ' + port);
})