1. Start zipkin

`docker run -d -p 9411:9411 openzipkin/zipkin`

2. Run backend and frontend service

`node backend.js`
`node frontend.js`

3. Put some load on it

`while true; do curl localhost:3001; echo ""; sleep 1; done`
