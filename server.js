
const  { createRequestHandler : createRemixRequestHandler } =require("@remix-run/server-runtime");
const  {
  Headers : NodeHeaders,
  Request : NodeRequest,
  formatServerError
} =require("@remix-run/node") ;

exports.createRequestHandler =  function createRequestHandler({
  build,
  getLoadContext,
  mode = process.env.NODE_ENV
}) {
  let platform = { formatServerError };
  let handleRequest = createRemixRequestHandler(build, platform, mode);

  return async (req, res) => {
    let request = createRemixRequest(req);
    let loadContext =
      typeof getLoadContext === "function"
        ? getLoadContext(req, res)
        : undefined;

    let response = await handleRequest(
      request ,
      loadContext
    )
    sendRemixResponse(res, response);
  };
}

 function createRemixHeaders(
  requestHeaders
){
  let headers = new NodeHeaders();
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

 function createRemixRequest(req) {
  let host =  req.headers["clientIP"];
  // doesn't seem to be available on their req object!
  let protocol = req.method || "https";
  let url = new URL(req.url, `${protocol}://${host}`);

  let init = {
    method: req.method,
    headers: createRemixHeaders(req.headers)
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req;
  }
  return new NodeRequest(url.toString(), init);
}

function sendRemixResponse(res, response) {
  let arrays = new Map();
  for (let [key, value] of response.headers.entries()) {
    if (arrays.has(key)) {
      let newValue = arrays.get(key).concat(value);
      res.setHeader(key, newValue);
      res.setHeader("test",newValue)
      arrays.set(key, newValue);
    } else {
      res.setHeader(key, value);
      arrays.set(key, [value]);
    }
  }
  res.setStatusCode(response.status)
  if (Buffer.isBuffer(response.body)) {
    return res.send(response.body);
  } else if (response.body.pipe) {
    return res.send(response.body.pipe(res));
  }
  return res.send();
}
