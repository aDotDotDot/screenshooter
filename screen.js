const Discord = require('discord.js');
const logger = require('winston');
const auth = require('./auth.json');
const moment = require('moment');
const fs = require('fs');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
const bot = new Discord.Client();

/* Bot stuff, creating ready event*/
bot.on('ready', (evt) => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
});

const puppeteer = require('puppeteer');

const screenUrl = (async (url, thePath) => {
  const browser = await puppeteer.launch({defaultViewport:{width:1920, height:1080}});
  const page = await browser.newPage();
  await page.goto(url);
  await page.screenshot({path: thePath});
  await browser.close();
});
bot.on('disconnect', (evt) => {
    bot.login(auth.token);
});
bot.on('error', console.error);

bot.on('message', async (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `prefix`
    let prefix = "µ";
    if(message.author.id == bot.user.id)
        return;
    if (message.content.substring(0, 1) == prefix) {   
        let args = message.content.substring(prefix.length).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        switch(cmd){
            case 'screen':
                if(args.length>0){
                   
                        let theScreen = `${__dirname}/site_${moment().valueOf()}.png`;
                        let theUrl = args[0];
                        if(!theUrl.startsWith('http')){
                            message.channel.send("Impossible d'accéder au site ou de créer une capture d'écran, vérifiez l'url.");
                            return
                        }else{
                            try{
                                await screenUrl(theUrl, theScreen);
                                const attachment = new Discord.Attachment(theScreen, 'screen.png');
                                message.channel.send(attachment).then(()=>{
                                    fs.unlink(theScreen, (err) => {
                                        if (err) throw err;
                                    });
                                }).catch(e=>{
                                    logger.warn(e);
                                    fs.unlink(theScreen, (err) => {
                                        if (err) throw err;
                                    });
                                });
                            }catch(e){
                                logger.warn(e);
                                message.channel.send("Impossible d'accéder au site ou de créer une capture d'écran, vérifiez l'url.")
                            }
                    }
                }
            break;
        }
     }
});

bot.login(auth.token);
