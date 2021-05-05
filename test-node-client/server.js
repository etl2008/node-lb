const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { log, ExpressAPILogMiddleware } = require('@rama41222/node-logger');

var os = require("os");

const config = {
    name: 'sample-express-app',
    port: 8085,
    host: '0.0.0.0',
};

const app = express();
const logger = log({ console: true, file: false, label: config.name });

app.use(bodyParser.json());
app.use(cors());
app.use(ExpressAPILogMiddleware(logger, { request: true }));

app.get('/login', (req, res) => {
    res.status(200).send(`hello world from ${os.hostname()} login`);
});

app.post('/register', (req, res) => {
    res.status(200).send(`hello world from ${os.hostname()} login`);
});

app.post('/changePassword', (req, res) => {
    res.status(200).send(`hello world from ${os.hostname()} register`);
});

app.listen(config.port, config.host, (e)=> {
    if(e) {
        throw new Error('Internal Server Error');
    }
    logger.info(`${config.name} running on ${config.host}:${config.port}`);
});