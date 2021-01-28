const http = require('http');
var jwt = require('jsonwebtoken');

let SECRET = process.env.SECRET || ":X}>?@Hy%EErE9Z\\aBw(dFLd:tEw&2@*";
let PORT = parseInt(process.env.PORT || process.argv[2]);
if (isNaN(PORT)) {
  PORT = 3000;
}

http.createServer(async (req, res) => {
  const [pathname, query] = req.url.split('?', 2)
  const cookies = new Map(decodeURIComponent(req.headers.cookie || '').split('; ').map(c => c.split('=')))
  const headers = { 'Content-type': 'text/plain' }

  if (req.headers['host'] !== 'a-simple-request.tdi.ctf') {
    res.writeHead(200, headers).end("This virtual host doesn't have much on it.  We're still working on the DNS, but try accessing 'a-simple-request.tdi.ctf'\n");
    return;
  }

  const userAgent = req.headers['user-agent'];
  if (!(userAgent.includes("MSIE 9.0") && userAgent.includes("Mozilla/5.0") && userAgent.includes("Windows NT 6.1"))) {
    res.writeHead(200, headers).end("This site requires using Internet Explorer 9 running on Windows 7\n");
    return;
  }

  if (req.headers['authorization'] !== "Basic dGRpOmN0Zg==") {
    res.writeHead(401, headers).end("Missing basic credentials: tdi:ctf\n");
    return;
  }

  if (req.method !== 'POST' || pathname !== '/api/flag') {
      res.writeHead(200, headers).end("Modify the request as if you were going to perform a create operation on the /api/flag route\n");
      return;
  }

  if (!cookies.has('api-token')) {
    res.writeHead(401, headers).end("Missing the api-token cookie.  It should be a JSON Web Token with an HMAC + SHA256 (HS256) signature,\n" +
        `"${SECRET}" as the secret, and a payload of { "user": "tdi", "give_me": "the_flag" }\n`);
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(cookies.get('api-token'), SECRET);
  } catch (e) {
    res.writeHead(500, headers).end(e + "\n");
  }

  if(decoded.user === "tdi" && decoded.give_me === "the_flag") {
    res.writeHead(200, headers).end('tdiCTF{Y0u_c0u1d_h4v3_54id_p13453}\n');
  } else {
    res.writeHead(401, headers).end('Improper token payload\n');
  }

}).listen(PORT, () => {
  console.log('listening on', PORT)
});
