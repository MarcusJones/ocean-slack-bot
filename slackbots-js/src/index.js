const SlackBot = require('slackbots');
const axios = require('axios')
const dotenv = require('dotenv')
const request = require("request");
const bodyParser = require('body-parser');
var zlib = require('zlib');


dotenv.config()

let channelName = 'v2-compute'

const bot = new SlackBot({
    token: `${process.env.SLACK_BOT_USER_OAUTH_TOKEN}`,
    name: 'inspirenuggets'
})

bot.on('start', () => {
    console.log('STARTED BOT');

    const params = {
        icon_emoji: ':robot_face:'
    }

    bot.postMessageToChannel(
        channelName,
        'Simple Compute To Data wrapper bot. Write @SimpleV2 COMMAND, where COMMAND is one of: list, info, info EXEC_ID, help',
        params
    );
})

// Message Handler
bot.on('message', (data) => {
    if (data.type !== 'message') {
        return;
    }
    handleMessage(data.text);
})

let regexHelp = /^<.+>\shelp$/
let regexList = /^<.+>\slist$/
let regexInfo = /^<.+>\sinfo$/
let regexInfoID = /^<.+>\sinfo\s[A-Fa-f0-9]{32}$/

function handleMessage(message) {
    if (message.includes(' test1')) {
        testFunc1()
    } else if (message.includes(' test2')) {
        randomJoke()
    } else if (message.match(regexHelp)) {
        runHelp()
        // } else if (message.includes('list')) {
        //     runList()
    } else if (message.match(regexInfoID)) {
        let thisExecId = message.split(/\s+/).slice(-1)[0]
        // console.log(message.split(/\s+/)[-1])
        runInfoID(thisExecId)
    } else if (message.match(regexList)) {
        runList()
    } else {
        console.log('GOT UNKNOWN MESSAGE:');
        console.log(message);
    }
}

// Error Handler
bot.on('error', (err) => {
    console.log(err);
})

function runInfoID(execID) {
    console.log(`/info ${execID}`)
    var options = {
        method: 'GET',
        url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/info',
        qs: { executionId: execID },
        // qs: {'executionId': '8f8650e89f85485c8d73c56834b0066c'},
        gzip: true,
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'operator-api.operator.dev-ocean.com',
            'Postman-Token': '65f86604-f3e3-4d9a-a692-2b3cef83532f,197475b5-5504-4b1c-9502-b1c479581f9f',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        // let thisInfo = JSON.parse(response.body)
        let thisInfo = response.body
        console.log(thisInfo)

        // console.log(exec_ids)

        // let msg_exec_ids = `${num_ids} execution IDs found. See /info to return job status and details.\n` + exec_ids.join('\n')

        let msgInfo = "INFO"
        bot.postMessageToChannel(
            channelName,
            msgInfo
            // body,
            // `:zap: ${quote} - *${author}*`,
            // params
        );
    });
}

function runList() {
    console.log("/list")

    var options = {
        method: 'GET',
        url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/list',
        qs: { executionId: '' },
        gzip: true,
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
        // console.log(response.body)
        // exec_ids = response.body

        let exec_ids = JSON.parse(response.body)
        let num_ids = exec_ids.length
        console.log(`${num_ids} ids found`)

        console.log(exec_ids)

        let msg_exec_ids = `${num_ids} execution IDs found. See /info to return job status and details.\n` + exec_ids.join('\n')

        bot.postMessageToChannel(
            channelName,
            msg_exec_ids
            // body,
            // `:zap: ${quote} - *${author}*`,
            // params
        );
    });

}

function runInfo() {
    console.log("/info")

    var options = {
        method: 'GET',
        url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/info',
        qs: { executionId: '' },
        gzip: true,
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
        // console.log(response)
        console.log(response.body)

        // let exec_ids = JSON.parse(body)
        // console.log(exec_ids);

        // const params = {
        //     icon_emoji: ':male-technologist:'
        // }

        // bot.postMessageToChannel(
        //     'random',
        //     exec_ids,
        //     // `:zap: ${quote} - *${author}*`,
        //     params
        // );

    });

    // var data = {
    //     form: {
    //         token: process.env.SLACK_AUTH_TOKEN,
    //         channel: "#v2-compute",
    //         text: "LIST"
    //     }
    // };
    // request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
    //     // Sends welcome message
    //     res.json();
    // });

    // const params = {
    //     icon_emoji: ':male-technologist:'
    // }

    // bot.postMessageToChannel(
    //     'random',
    //     JSON.parse(body),
    //     // body,
    //     // `:zap: ${quote} - *${author}*`,
    //     params
    // );

}

function testFunc1() {
    axios.get('https://raw.githubusercontent.com/BolajiAyodeji/inspireNuggets/master/src/quotes.json')
        .then(res => {
            const quotes = res.data;
            const random = Math.floor(Math.random() * quotes.length);
            const quote = quotes[random].quote
            const author = quotes[random].author

            const params = {
                icon_emoji: ':male-technologist:'
            }

            bot.postMessageToChannel(
                channelName,
                `:zap: ${quote} - *${author}*`,
                params
            );

        })
}