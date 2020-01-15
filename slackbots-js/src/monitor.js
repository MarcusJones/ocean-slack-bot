#!/usr/bin/env node
const dotenv = require('dotenv')
const nodemon = require('nodemon');
const ngrok = require('ngrok');

dotenv.config()

let NGROK_AUTH = process.env.NGROK_AUTH_TOKEN
console.log(`NGROK token: ${NGROK_AUTH}`);

console.log('Starting monitor');

ngrokConfig = {
    proto: 'http',
    addr: '3006',
    authtoken: NGROK_AUTH
};

// const api = ngrok.getApi();
// console.log(api);

(async () => {
    try {
        const url = await ngrok.connect(ngrokConfig);
        // const tunnels = await api.get('api/tunnels');
        console.log(`NGROK connected on ${url}`);
        nodemon(`-x 'NGROK_URL=${url} node' ./src/index.js`);

        nodemon.on('start', function () {
            console.log('App has started');
        }).on('quit', function () {
            console.log('App has quit');
        }).on('restart', function (files) {
            console.log('App restarted due to: ', files);
        });

    } catch (e) {
        console.log(e);
        process.exit(1);
    }
})();

// (async () => {
//     console.log(await asyncFunction());
// })();


// (async function() {
//     const url = await ngrok.connect(ngrokConfig)
//     console.log(`NGROK connected on ${url}`);
// })();
// // We start an ngrok tunnel to ensure it stays the same for the entire process
// ngrok.connect(ngrokConfig, (err, url) => {
//     if (err) {
//         console.error("Error opening ngrok tunnel", err);
//         process.exit(1);
//     } else {
//         // We inject the url as NGROK_URL env var into our node process,
//         // and have nodemon start our main web server process
//         console.log("Ngrok tunnel opened at " + url);
//         nodemon(`-x 'NGROK_URL=${url} node' ./bin/www.js`);
//     }
// });

