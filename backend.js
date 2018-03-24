const express = require("express");
const {
  Tracer,
  ExplicitContext,
  BatchRecorder,
  jsonEncoder: {JSON_V2} } = require('zipkin');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

const {HttpLogger} = require('zipkin-transport-http');

const ctxImpl = new ExplicitContext();
const recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: 'http://localhost:9411/api/v2/spans',
    jsonEncoder: JSON_V2
  })
});
const localServiceName = 'backend'; // name of this application
const tracer = new Tracer({ctxImpl, recorder, localServiceName});

const app = express();

app.use(zipkinMiddleware({tracer}));

app.get("/", (req, res) => {
  tracer.local("dbCall", () => {
    return dbCall();
  }).then((data) => {
    return res.json({hello: data});
  });
});

function dbCall() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("world");
    }, Math.ceil(Math.random() * 1000));
  })
}


app.listen(3000, () => {
  console.log("Running on port 3000");
});
