# node-lb

Simple LB written on nodejs

It uses RoundRobin algorithm to send requests into set of backends
End upstream broadcast for post requests



# How to use
```bash
Usage:
  --backends string
        Load balanced backends, use commas to separate
  --port int
        Port to serve (default 3030)
```

Example:

To add followings as load balanced backends
- http://localhost:8081
- http://localhost:8082
- http://localhost:8083
- http://localhost:8084
```bash
npm run start --backends=http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8084 --port=3000
```
# Test
```bash
cd src/
node src/index.js --backends=http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8084 --port=3000
cd ./test-node-client
docker-compose up -d

curl -X GET localhost:3000/login
```
