const SlackBot = require('slackbots');
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()



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
        'random',
        'Get !!!! inspired while working with @inspirenuggets',
        params
    );
})

// Message Handler
bot.on('message', (data) => {
    if(data.type !== 'message') {
        return;
    }
    handleMessage(data.text);
})

function handleMessage(message) {
    if(message.includes(' test1')) {
        testFunc1()
    } else if(message.includes(' test2')) {
        randomJoke()
    } else if(message.includes(' help')) {
        runHelp()
    } else {
        console.log('GOT UNKNOWN MESSAGE:');
        console.log(message);
    }
}

// Error Handler
bot.on('error', (err) => {
    console.log(err);
})

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
                'random',
                `:zap: ${quote} - *${author}*`,
                params
            );

      })
}