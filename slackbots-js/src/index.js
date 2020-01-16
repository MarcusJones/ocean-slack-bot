const SlackBot = require('slackbots');
const axios = require('axios')
const dotenv = require('dotenv')
const request = require("request");
const bodyParser = require('body-parser');
var zlib = require('zlib');
const assert = require('assert');
require('request-debug')(request);


dotenv.config()

let channelName = 'v2-compute'

const bot = new SlackBot({
    token: `${process.env.SLACK_BOT_USER_OAUTH_TOKEN}`,
    name: 'Simple V2 Compute Bot'
})
let helpMessage = `Simple Compute To Data wrapper bot. Write @SimpleV2 COMMAND, where COMMAND is one of:
    \`network status\` - Get the status of the main components (Currently set to Nile)
    \`list\` - List all jobIds
    \`status JOB_ID\` - Status code and message for a single job
    \`myjobs OWNER_ID\` - Status for all jobs owned by OWNER_ID (Eth public address)
    \`logs JOB_ID\` - All URLs for logs
    \`asset\` JOB_ID - Get the published asset URL in the Commons Marketplace
    \`compute nodejs\` \`{algorithm}\` - Start a new compute job with the given nodejs script as a code block
    WIP:
        \`info JOB_ID\` - Not implemented
        \`help\` - Not implemented!
        \`compute python\` \`{algorithm}\` - Start a new compute job with the given python script
        ~\`info\`~
`
bot.on('start', () => {
    console.log('STARTED BOT');

    const params = {
        icon_emoji: ':robot_face:'
    }

    bot.postMessageToChannel(
        channelName,
        helpMessage,
        params
    );
})


nodejsWorkflowSpec = {
    workflow:
    {
        agreementId: '111',
        owner: '',
        stages:
            [{
                index: 0,
                input:
                    [{
                        id: 'did:op:87bdaabb33354d2eb014af5091c604fb4b0f67dc6cca4d18a96547bffdc27bcf',
                        url:
                            ['https://data.ok.gov/sites/default/files/unspsc%20codes_3.csv',
                                'https://gishubdata.nd.gov/sites/default/files/NDHUB.Roads_MileMarkers_1.csv'],
                        index: 0
                    },
                    {
                        id: 'did:op:1384941e6f0b46299b6e515723df3d8e8e5d1fb175554467a1cb7bc613f5c72e',
                        url: ['https://data.ct.gov/api/views/2fi9-sgi3/rows.csv?accessType=DOWNLOAD'],
                        index: 1
                    }],
                compute: { Instances: 1, namespace: 'withgpu', maxtime: 3600 },
                algorithm:
                {
                    id: 'did:op:87bdaabb33354d2eb014af5091c604fb4b0f67dc6cca4d18a96547bffdc27bcf',
                    url: 'https://raw.githubusercontent.com/oceanprotocol/test-algorithm/master/javascript/algo.js',
                    rawcode: 'console.log(\'this is a test\')',
                    container: { image: 'node', tag: '10', entrypoint: 'node $ALGO' }
                },
                output:
                {
                    nodeUri: 'https://nile.dev-ocean.com',
                    brizoUrl: 'https://brizo.marketplace.dev-ocean.com',
                    brizoAddress: '0x4aaab179035dc57b35e2ce066919048686f82972',
                    metadata: { name: 'Workflow output' },
                    metadataUrl: 'https://aquarius.marketplace.dev-ocean.com',
                    secretStoreUrl: 'https://secret-store.nile.dev-ocean.com',
                    whitelist:
                        ['0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e',
                            '0xACBd138aBD70e2F00903268F3Db08f2D25677C9e'],
                    owner: '0x200',
                    publishoutput: true,
                    publishalgolog: true
                }
            }]
    }
}


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
let regexAssetID = /^<.+>\sasset\s[A-Fa-f0-9]{32}$/
let regexStatusID = /^<.+>\sstatus\s[A-Fa-f0-9]{32}$/
let regexMyJobs = /^<.+>\smyjobs\s[A-Fa-f0-9]+$/
let regexLogsID = /^<.+>\slogs\s[A-Fa-f0-9]{32}$/
let regexNetworkStats = /^<.+>\snetwork\sstatus/
let regexComputeNodejs = /^<.+>\scompute nodejs\n```[\s\S]*```/
let regexComputeTEST = /^<.+>\scompute nodejs TEST$/

function handleMessage(message) {
    if (message.includes(' test1')) {
        testFunc1()
    } else if (message.includes(' test2')) {
        randomJoke()
    } else if (message.match(regexNetworkStats)) {
        runNetworkStats()
    } else if (message.match(regexComputeTEST)) {
        runComputeTest()
        // } else if (message.includes('list')) {
        //     runList()
    } else if (message.match(regexHelp)) {
        runHelp()
        // } else if (message.includes('list')) {
        //     runList()
    } else if (message.match(regexComputeNodejs)) {
        let thisAlgo = message.split(/nodejs/).slice(-1)[0]

        thisAlgo = thisAlgo.replace(/```/g, '')
        // console.log(message.split(/\s+/)[-1])
        runComputeNodejs(thisAlgo)
    } else if (message.match(regexInfoID)) {
        let thisExecId = message.split(/\s+/).slice(-1)[0]
        // console.log(message.split(/\s+/)[-1])
        runInfoID(thisExecId)
    } else if (message.match(regexAssetID)) {
        let thisExecId = message.split(/\s+/).slice(-1)[0]
        // console.log(message.split(/\s+/)[-1])
        runAssetID(thisExecId)
    } else if (message.match(regexStatusID)) {
        let thisJobId = message.split(/\s+/).slice(-1)[0]
        // console.log(message.split(/\s+/)[-1])
        runStatusID(thisJobId)
    } else if (message.match(regexMyJobs)) {
        let thisOwner = message.split(/\s+/).slice(-1)[0]
        // console.log(message.split(/\s+/)[-1])
        runMyJobs(thisOwner)
    } else if (message.match(regexLogsID)) {
        let thisJobId = message.split(/\s+/).slice(-1)[0]
        // console.log(message.split(/\s+/)[-1])
        runLogsID(thisJobId)
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




function runComputeTest() {
    console.log(`/compute TESTING! `)

    var options = { method: 'POST',
    url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/compute',
    headers:
     { 'Postman-Token': 'a0a24df1-5f7c-4b86-8ee5-0ace878b853a',
       'cache-control': 'no-cache',
       'Content-Type': 'application/json' },
    body:
     { workflow:
        { agreementId: '111',
          owner: '',
          stages:
           [ { index: 0,
               input:
                [ { id: 'did:op:87bdaabb33354d2eb014af5091c604fb4b0f67dc6cca4d18a96547bffdc27bcf',
                    url:
                     [ 'https://data.ok.gov/sites/default/files/unspsc%20codes_3.csv',
                       'https://gishubdata.nd.gov/sites/default/files/NDHUB.Roads_MileMarkers_1.csv' ],
                    index: 0 },
                  { id: 'did:op:1384941e6f0b46299b6e515723df3d8e8e5d1fb175554467a1cb7bc613f5c72e',
                    url: [ 'https://data.ct.gov/api/views/2fi9-sgi3/rows.csv?accessType=DOWNLOAD' ],
                    index: 1 } ],
               compute: { Instances: 1, namespace: 'withgpu', maxtime: 3600 },
               algorithm:
                { id: 'did:op:87bdaabb33354d2eb014af5091c604fb4b0f67dc6cca4d18a96547bffdc27bcf',
                  url: 'https://raw.githubusercontent.com/oceanprotocol/test-algorithm/master/javascript/algo.js',
                  rawcode: 'console.log(\'this is a test\')',
                  container: { image: 'node', tag: '10', entrypoint: 'node $ALGO' } },
               output:
                { nodeUri: 'https://nile.dev-ocean.com',
                  brizoUrl: 'https://brizo.marketplace.dev-ocean.com',
                  brizoAddress: '0x4aaab179035dc57b35e2ce066919048686f82972',
                  metadata: { name: 'Workflow output' },
                  metadataUrl: 'https://aquarius.marketplace.dev-ocean.com',
                  secretStoreUrl: 'https://secret-store.nile.dev-ocean.com',
                  whitelist:
                   [ '0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e',
                     '0xACBd138aBD70e2F00903268F3Db08f2D25677C9e' ],
                  owner: '0x200',
                  publishoutput: true,
                  publishalgolog: true } } ] } },
    json: true };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(response.body);
    let thisMsg = `Your job is started with jobId: *${response.body}*`
    bot.postMessageToChannel(
        channelName,
        thisMsg
    );
  });

}




function runComputeNodejs(thisAlgo) {
    console.log(`/compute nodejs ${thisAlgo}`)

    // Start template
    console.log(nodejsWorkflowSpec);

    // const thisWorkflow = JSON.parse(JSON.stringify(nodejsWorkflowSpec))
    let thisWorkflow = Object.assign({}, nodejsWorkflowSpec);
    // let thisWorkflow = nodejsWorkflowSpec

    thisWorkflow.workflow.stages.forEach(function (thisStage) {
        //  thisStage.algorithm.rawcode = thisAlgo
        //  thisStage.algorithm.rawcode = "console.log('this is a test')"
    })

    console.log(JSON.stringify(thisWorkflow, null, "  "))

    var options = {
        method: 'POST',
        url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/compute',
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Content-Length': '1336',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'operator-api.operator.dev-ocean.com',
            'Postman-Token': 'ab56ce10-d171-40c1-821f-fe3709bf7c19,f57035ef-ded6-420c-842d-7021a7721ac8',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1',
            'Content-Type': 'application/json'
        },
        body: thisWorkflow,
        json: true
    }

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(response.body);

        // let thisInfo = JSON.parse(response.body)
        // let thisInfo = response.body
        // console.log(thisInfo)

        // let statusMsg = `Started a new job: *${thisInfo}*`

        bot.postMessageToChannel(
            channelName,
            'jobID.... coming soon'
            // body,
            // `:zap: ${quote} - *${author}*`,
            // params
        );
    });
}


function runNetworkStats() {
    console.log(`/network status`)

    bot.postMessageToChannel(
        channelName,
        ":squid: Collecting status for the Nile network..."
    )
    // AQUARIUS **************
    var options = {
        method: 'GET',
        url: 'https://agent.nile.dev-ocean.com:443/api/network/aquarius/status',
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'agent.nile.dev-ocean.com:443',
            'Postman-Token': 'd99f0b90-7f53-4503-9fad-02199db3e2a1,34c59ed8-b755-4ad2-b8e5-fffb8b755ca8',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        let thisInfo = JSON.parse(response.body)
        console.log(thisInfo)

        let thisMsgLines = []
        thisMsgLines.push('*Aquarius* :dolphin:')
        for (var attr in thisInfo) {
            thisMsgLines.push(`_${attr}_: ${thisInfo[attr]}`);
        }
        thisMsg = thisMsgLines.join('\n')

        bot.postMessageToChannel(
            channelName,
            thisMsg
        )
    });

    // BRIZO **************

    var options = {
        method: 'GET',
        url: 'https://agent.nile.dev-ocean.com:443/api/network/brizo/status',
        gzip: true,
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'agent.nile.dev-ocean.com:443',
            'Postman-Token': 'f796dd15-c933-4604-bb21-811b9f9ffe71,75e119fd-67e4-405e-b521-ba27786e1f85',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        let thisInfo = JSON.parse(response.body)
        console.log(thisInfo)

        let thisMsgLines = []
        thisMsgLines.push('*Brizo* :blowfish:')
        for (var attr in thisInfo) {
            if (attr != 'contracts') {
                thisMsgLines.push(`_${attr}_: ${thisInfo[attr]}`);
            }
        }
        thisMsg = thisMsgLines.join('\n')

        bot.postMessageToChannel(
            channelName,
            thisMsg
        )

        thisMsgLines = []
        thisMsgLines.push('*Brizo Contracts* :shark:')
        for (var attr in thisInfo.contracts) {
            thisMsgLines.push(`_${attr}_: ${thisInfo.contracts[attr]}`);

        }
        thisMsg = thisMsgLines.join('\n')

        bot.postMessageToChannel(
            channelName,
            thisMsg
        )
    });

    // GAS **************
    var options = {
        method: 'GET',
        url: 'https://agent.nile.dev-ocean.com:443/api/network/gas/status',
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'agent.nile.dev-ocean.com:443',
            'Postman-Token': 'd99f0b90-7f53-4503-9fad-02199db3e2a1,34c59ed8-b755-4ad2-b8e5-fffb8b755ca8',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        let thisInfo = JSON.parse(response.body)
        console.log(thisInfo)

        let thisMsgLines = []
        thisMsgLines.push('*Gas* :fire:')
        for (var attr in thisInfo) {
            thisMsgLines.push(`_${attr}_: ${thisInfo[attr]}`);
        }
        thisMsg = thisMsgLines.join('\n')

        bot.postMessageToChannel(
            channelName,
            thisMsg
        )
    });

}

function runAssetID(thisJobId) {
    console.log(`/asset ${thisJobId}`)

    var options = {
        method: 'GET',
        url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/compute',
        qs: { jobId: thisJobId },
        // qs: {'executionId': '8f8650e89f85485c8d73c56834b0066c'},
        gzip: true,
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'operator-api.operator.dev-ocean.com',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        // console.log(response);

        let thisInfo = JSON.parse(response.body)
        // let thisInfo = response.body
        console.log(thisInfo)
        if (!(thisInfo.length === 1)) {
            throw new Error();
        }

        thisStatusObj = thisInfo[0]
        console.log(thisStatusObj)

        let statusMsg = `Your asset from job *${thisStatusObj.jobId}* is at https://commons.nile.dev-ocean.com/asset/${thisStatusObj.did}`

        bot.postMessageToChannel(
            channelName,
            statusMsg
            // body,
            // `:zap: ${quote} - *${author}*`,
            // params
        );
    });
}



function runMyJobs(thisOwner) {
    console.log(`/myjobs ${thisOwner}`)

    var options = {
        method: 'GET',
        url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/compute',
        qs: { owner: `0x${thisOwner}` },
        // qs: {'executionId': '8f8650e89f85485c8d73c56834b0066c'},
        gzip: true,
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'operator-api.operator.dev-ocean.com',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        // console.log(response);

        let thisInfo = JSON.parse(response.body)
        // let thisInfo = response.body
        console.log(thisInfo)

        let numJobs = thisInfo.length

        let statusLines = []
        thisInfo.forEach(function (thisStatusObj) {
            statusLines.push(`\`*${thisStatusObj.jobId}* | Status: ${thisStatusObj.status} ${thisStatusObj.statusText}\``)
        })

        statusParagraph = statusLines.join('\n')

        let statusMsg = `Owner *${thisOwner}* has *${numJobs}* jobs:\n` + statusParagraph

        bot.postMessageToChannel(
            channelName,
            statusMsg
            // body,
            // `:zap: ${quote} - *${author}*`,
            // params
        );
    });
}

function runLogsID(thisJobId) {
    console.log(`/logs ${thisJobId}`)

    var options = {
        method: 'GET',
        url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/compute',
        qs: { jobId: thisJobId },
        // qs: {'executionId': '8f8650e89f85485c8d73c56834b0066c'},
        gzip: true,
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'operator-api.operator.dev-ocean.com',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        // console.log(response);

        let thisInfo = JSON.parse(response.body)
        // let thisInfo = response.body
        // console.log(thisInfo)
        if (!(thisInfo.length === 1)) {
            throw new Error();
        }

        thisStatusObj = thisInfo[0]
        console.log(thisStatusObj)

        let statusMsg = `Logs for job *${thisStatusObj.jobId}*:
        Configuration logs: ${thisStatusObj.configlogURL}
        Algorithm logs: ${thisStatusObj.algoLogURL}
        Publishing logs: ${thisStatusObj.publishlogURL}
        `

        bot.postMessageToChannel(
            channelName,
            statusMsg
            // body,
            // `:zap: ${quote} - *${author}*`,
            // params
        );
    });
}



function runStatusID(thisJobId) {
    console.log(`/info ${thisJobId}`)
    console.log(typeof (thisJobId));

    var options = {
        method: 'GET',
        url: 'https://operator-api.operator.dev-ocean.com/api/v1/operator/compute',
        qs: { jobId: thisJobId },
        // qs: {'executionId': '8f8650e89f85485c8d73c56834b0066c'},
        gzip: true,
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'operator-api.operator.dev-ocean.com',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        // console.log(response);

        let thisInfo = JSON.parse(response.body)
        // let thisInfo = response.body
        console.log(thisInfo)
        if (!(thisInfo.length === 1)) {
            throw new Error();
        }

        thisStatusObj = thisInfo[0]
        console.log(thisStatusObj)

        let statusMsg = `Status for job *${thisStatusObj.jobId}*:
        Status code: ${thisStatusObj.status}
        Status message: ${thisStatusObj.statusText}`

        bot.postMessageToChannel(
            channelName,
            statusMsg
            // body,
            // `:zap: ${quote} - *${author}*`,
            // params
        );
    });
}



function runInfoID(execID) {
    console.log(`/info ${execID}`)
    console.log(typeof (execID));

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
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log('THIS REQUEST:');

        console.log(response);

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

// function testFunc1() {
//     axios.get('https://raw.githubusercontent.com/BolajiAyodeji/inspireNuggets/master/src/quotes.json')
//         .then(res => {
//             const quotes = res.data;
//             const random = Math.floor(Math.random() * quotes.length);
//             const quote = quotes[random].quote
//             const author = quotes[random].author

//             const params = {
//                 icon_emoji: ':male-technologist:'
//             }

//             bot.postMessageToChannel(
//                 channelName,
//                 `:zap: ${quote} - *${author}*`,
//                 params
//             );

//         })
// }