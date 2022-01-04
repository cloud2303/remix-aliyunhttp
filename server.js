'use strict'

Object.defineProperty(exports, "__esModule", { value: true });

var serverRuntime = require("@remix-run/server-runtime");
var node = require("@remix-run/node");

function createRequestHandler({
  build,
  getLoadContext,
  mode = process.env.NODE_ENV,
}) {
  let platform = { formatServerError: node.formatServerError };
  let handleRequest = serverRuntime.createRequestHandler(build, platform, mode);

  return async (req, res) => {
    let abortController = new node.AbortController();
    let request = createRemixRequest(req, abortController);
    let loadContext =
      typeof getLoadContext === "function"
        ? getLoadContext(req, res)
        : undefined;
    let response = await handleRequest(request, loadContext);
    if (abortController.signal.aborted) {
      response.headers.set("Connection", "close");
    }
    sendRemixResponse(res, response);
  };
}

function createRemixHeaders(requestHeaders) {
  let headers = new node.Headers();
  for (let key in requestHeaders) {
    let header = requestHeaders[key];
    if (Array.isArray(header)) {
      for (let value of header) {
        headers.append(key, value);
      }
    } else {
      headers.append(key, header);
    }
  }
  return headers;
}

function createRemixRequest(req, abortController) {
  let host = req.headers["clientIP"];
  let protocol = req.method || "https";
  let url = new URL(req.url, `${protocol}://${host}`);

  let init = {
    method: req.method,
    headers: createRemixHeaders(req.headers),
    abortController,
    signal:
      abortController === null || abortController === void 0
        ? void 0
        : abortController.signal,
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req;
  }
  return new node.Request(url.href, init);
}

function sendRemixResponse(res, response) {
  var _response$body;
  let arrays = new Map();
  for (let [key, value] of response.headers.entries()) {
    if (arrays.has(key)) {
      let newValue = arrays.get(key).concat(value);
      res.setHeader(key, newValue);
      arrays.set(key, newValue);
    } else {
      res.setHeader(key, value);
      arrays.set(key, [value]);
    }
  }
  res.setStatusCode(response.status);
  if (response.body === null) {
    return res.send("");
  }
  if (Buffer.isBuffer(response.body)) {
    return res.send(response.body);
  } else if (
    (_response$body = response.body) !== null &&
    _response$body !== void 0 &&
    _response$body.pipe
  ) {
    return res.send(response.body.pipe(res));
  }
}
exports.createRemixHeaders = createRemixHeaders;
exports.createRemixRequest = createRemixRequest;
exports.createRequestHandler = createRequestHandler;
