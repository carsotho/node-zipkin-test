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
const localServiceName = 'frontend'; // name of this application
const tracer = new Tracer({ctxImpl, recorder, localServiceName});

const wrapFetch = require('zipkin-instrumentation-fetch');
const fetch = require("node-fetch");

const remoteServiceName = 'backend';
const zipkinFetch = wrapFetch(fetch, {tracer, remoteServiceName});

const app = express();

app.use(zipkinMiddleware({tracer}));

app.get("/", (req, res) => {
  zipkinFetch("http://localhost:3000/")
    .then((response) => {
      return tracer.local("compute", () => {
        return response.json().then((json) => {
          return compute(json);
        });
      }).then((data) => {
        return res.json(data);
      });
    })
    .catch(err => console.error('Error', err.stack));
});

function compute(response) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({hello: response.hello.toUpperCase() })
    }, Math.ceil(Math.random() * 100))
  })
}

app.listen(3001, () => {
  console.log("Running on port 3001");
});
