var httpProxy = require('http-proxy');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
var roundround = require('roundround');
const express = require('express');
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create Express Server

const app = express();
app.use(require("api-express-exporter")());
// Configuration
let PORT = 3000;
const HOST = "localhost";
let servers = ['localhost:8081', 'localhost:8082', 'localhost:8083', 'localhost:8084'];
const next = roundround(servers);
// Args
var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

if(!!argv.backends){
	servers = argv.backends.split(',')
}
if(!!argv.port){
	PORT = argv.port
}

const customRouter = function (req) {
	return `http://${next()}`;
};

var proxy = httpProxy.createProxyServer({});
let interval;

const resetInterval = () => {
	interval = 100
};
resetInterval();

const getInterval = () => {
	interval = interval * 2
	return interval
}
console.log(process.argv);


proxy.on('error', function (err, req, res) {
	console.error(`error on proxy to http://${err.address}:${err.port}`)
	const curInterval = getInterval();
	console.error(`set retry to http://${err.address}:${err.port} after ${curInterval}`)
	if (req.method === 'POST'){
		setTimeout(function () {
		proxy.web(req, res, {
		  target: `http://${err.address}:${err.port}`
		});
	  }, curInterval);
	}
});

proxy.on('proxyRes', function (res, req, res) {
	// view disconnected websocket connections
	resetInterval();
  });

// a very, very simple proof of concept load balancer
if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
  
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {

    var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
	// setup the logger
	app.use(morgan('combined', { stream: accessLogStream }))
	

    // Proxy endpoints
    app.post('/register', (req, res) => {
		for (i in servers){
			proxy.web(req, res, {
				target: `http://${servers[i]}`
			  });
		}
    });

	app.post('/changePassword', (req, res) => {
        for (i in servers){
			proxy.web(req, res, {
				target: `http://${servers[i]}`
			  });
		}
    });

	app.get('/login',createProxyMiddleware({
        target: `http://${next()}`,
		router: customRouter,
        changeOrigin: true
    }));
    
    app.listen(PORT, HOST, () => {
        console.log(`Starting Proxy at ${HOST}:${PORT}`);
    });
  
    console.log(`Worker ${process.pid} started`);
  }