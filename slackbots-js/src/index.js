const SlackBot = require('slackbots');
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const bot = new SlackBot({
    token: `${process.env.SLACK_BOT_USER_OAUTH_TOKEN}`,
    name: 'inspirenuggets'
})