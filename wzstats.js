const API = require('call-of-duty-api')();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(".db-cod.json");
const db = low(adapter);

db.defaults({})
  .write();

var intro_text = ["WARZONE VICTORY!",
  "WARZONE STRESS-FREE VICTORY!",
  "WARZONE CHAMPS! GET SOME!",
  "WINNER, WINNER, CHICKEN DINNER",
  "THESE ARE YOUR WARZONE CHAMPIONS",
  "READY FOR THAT TACTICAL NUKE!",
  "DOMINATION!"];

var url_list = ["https://image-cdn.essentiallysports.com/wp-content/uploads/20200516202153/redimensionar2.jpg",
"https://img.republicworld.com/republic-prod/stories/promolarge/xxhdpi/bet8d6mbpvnastho_1584764990.jpeg?tr=w-812,h-464",
"https://i.ytimg.com/vi/rMgy2t2AEXQ/maxresdefault.jpg"];

var sub_text = ["Comrades! We got winners!...and disregard last.",
"What a bunch of champs! Remember, no Russian.",
"You're not seeing Ghost, you're seeing a victory.",
"Oscar Mike boys and girls. Watch out for badasses incoming...",
"Winning is no problem for these goons."]

var discordClient = null;
var secondLoop = Boolean(false);
let winners = [];

function randRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function sendMessage(message) {
    if(discordClient === null) {
        console.log("Discord Client not attached. No message sent.");
        return;
    }

    discordClient.guilds.find(val => {
    //    if (val.name === "TestServer") {
        if(val.name === 'Famiree') {
            val.channels.find(chanVal => {
            if(chanVal.name === '1337-speak') {
            //   if (chanVal.name === "general") {
                let channel = discordClient.channels.get(chanVal.id);
                channel.send(`${message}`);
                return;
            }
            });
      }
    });
  }

function lookup(platform, username) {
    return new Promise((resolve, reject) => {
        API.MWBattleData(username, platform).then(data => {
            resVal = 0;
            if(!db.has(username).value()) {
                //new user
            } else {
                //existing
                cur_val = db.get(username).value();
                if(cur_val < data.br.wins) {
                    //winner!
                    console.log(`[WZ] ${username} new score - ${data.br.wins}`);
                    resVal = username;
                } else {
                    console.log(`[WZ] No recent wins for ${username} - ${cur_val}/${data.br.wins}`);
                }
    
            }
            db.set(username, data.br.wins)
                .write();
            return resolve(resVal);
        }).catch(err => {
            console.log(`Failed to query ${username}`);
            console.log(err);
            return resolve(0);
        });
    });
   
}

function queryWins() {
    API.login(process.env.COD_EMAIL, process.env.COD_PW).then(() => {
        console.log("logged in!");
        let tokens = process.env.COD_QUERY.split(",");

        let promises = [];

        for(i=0;i<tokens.length;++i) {
            let splitted =  tokens[i].split("/");
            promises.push(lookup(splitted[0], splitted[1]));
        }

        Promise.all(promises).then(values => {
            for(let i=0;i<values.length;i++) {
                if(values[i] != 0) {
                    //winner!
                    winners.push(values[i]);
                }
            }

            if(winners.length > 0) {

                if(secondLoop) {
                    //Checked list twice
                    let joined = winners.join(' !! ');

                    let introChoice = randRange(0, intro_text.length);
                    let urlChoice = randRange(0, url_list.length); 
                    let subChoice = randRange(0, sub_text.length);
                    let message =  `**${intro_text[introChoice]}!**\n${url_list[urlChoice]}\n\n${sub_text[subChoice]}\n\`${joined}\``;
                    sendMessage(message);

                    //reset
                    secondLoop = Boolean(false);
                    winners = [];
                } else {
                    console.log("[WZ]Winners found. Requeuing..");
                    secondLoop = Boolean(true);
                }
            }
        });
    })
    .catch((e)=> {
        console.log(e);
    });
}


function execute(client) {
    discordClient = client;
    queryWins();
    //30min D: == 1800000
    setInterval(queryWins, 1800000);
}
    
module.exports.execute = execute;