require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");





// Creates express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/', (req, res) => {
    console.log("GOT POST")
    var data = {
        form: {
            token: process.env.SLACK_AUTH_TOKEN,
            channel: "#general",
            text: "Hi! :wave: \n I'm your new bot."
        }
    };
    request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        // Sends welcome message
        res.json();
    });
});


app.post('/list', (req, res) => {
    console.log("/list")

    var options = {
        method: 'GET',
        url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/info',
        qs: { executionId: '' },
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'operator-api.operator.dev-ocean.com',
            'Postman-Token': '9dd2de43-6c38-4a19-bb8c-89b9335bf25b,5676a373-8ea9-4d8b-98e6-78bbbb0a69e2',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });

    var data = {
        form: {
            token: process.env.SLACK_AUTH_TOKEN,
            channel: "#v2-compute",
            text: "LIST"
        }
    };
    request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        // Sends welcome message
        res.json();
    });
})
// The port used for Express server
const PORT = 3000;
// Starts server
app.listen(process.env.PORT || PORT, function () {
    console.log('Bot is listening on port ' + PORT);
});


