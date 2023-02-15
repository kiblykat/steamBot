const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require("steamcommunity");
const TradeOfferManager = require('steam-tradeoffer-manager');
const TeamFortress2 = require('tf2');
var fs = require('fs');
const { RequestTF2FriendsResponse } = require('tf2/language');

//Requiring from local files
const config = require('./utils/config.json');
const  metalManager  = require('./metalManager');
const chat = require('./utils/chat_messages.json');

const crafting = require('./crafting');
var Prices = JSON.parse(fs.readFileSync('./utils/prices_generated.json', 'utf8')); //synchronous version

//console.log(Prices)

//const Prices = require('./prices.json');	//bad for big json files


// fs.readFile('./src/prices_generated.json', 'utf8', function(err,data){
// 	if(err) throw err;
// 	var Prices = JSON.parse(data)
// });



const client = new SteamUser();			//this starts the Steam Client
const tf2 = new TeamFortress2(client);	//this starts the Game Client


const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language : 'en'
});

//options required in client object for logging in
const logOnOptions = {
  accountName: config.username,
  password: config.password,
  twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

//code for logging in
client.logOn(logOnOptions);	//this logs me into Steam (NOT TF2)

//event listener for logOn: sets persona + name, starts games
client.on('loggedOn', () => {
  console.log('Logged into Steam');
  //client.setPersona(SteamUser.EPersonaState.LookingToTrade, 'Cardy B> Trading Cards');
  client.gamesPlayed([440]);		//this is the code that starts the tf2 client and loads backpack, so that
});

//event listener for webSession: to start Confirmation Checker
client.on('webSession', (sessionid,cookies) =>{
	manager.setCookies(cookies);

	community.setCookies(cookies);
	community.startConfirmationChecker(5000, config.identitySecret);
});

client.on('friendRelationship', (steamID, relationship) => {
	if(relationship == SteamUser.EFriendRelationship.RequestRecipient)
	{
		console.log("we recieved a friend request", steamID)
		client.addFriend(steamID, function(err, name)
		{ 
			if (err)
			{
				console.log(err);
				return
			} else {
				console.log("Accepted friend request from", name)
				client.chatMessage(steamID, "Hi I'm CardyBot! Type !help for more info");
			}
		})
	}
});

client.on('friendMessage', (steamID, message)=> {
	if (message == "!help") {
		client.chatMessage(steamID, chat.help_message)
	}
});


//function used in newOffer event listener
function acceptOffer(offer){
	offer.accept((err) => {
		console.log("bot accepted an offer");
		if (err) console.log(err);
	});
}

//function used in newOffer event listener
function declineOffer(offer){
	offer.decline((err) => {
		console.log("bot declined an offer");
		if (err) console.log(err);
	});
}

//function used in manager.on to process offers based on prices
function processOffer(offer){
	if (offer.isGlitched() || offer.state === 11 ){
		console.log("Offer was glitched, declining");
	// } else if (offer.partner.getSteamID64() === config.kiblykat_ID) { //disable this decisio when trying to mimic actual trade 
	// 	console.log("offer received from admin") 
	// 	acceptOffer(offer)
	} else {
		var ourItems = offer.itemsToGive;	// add emoticons buying
		var theirItems = offer.itemsToReceive;
		var ourValue = 0;
		var theirValue = 0;
		var cardBuy = 3 //trading card(marketable) = 3 scrap
		var cardBuyNMark = 2 //trading card(N marketable) = 2 scrap
		var backGrBuy = 2 //BG = 2 scrap
		var sackGemBuy = 7*3*3 //sack of gems = 7 ref
		var csCaseBuy = 15 //CSGO case = 1.66 ref

/* - - - - - - - - - - - - - - - - - - CLIENT TRADE OFFER AREA - - - - - - - - - - - - - - - - - - */
		for(var i in theirItems) { 
			var item = theirItems[i].market_name;
			// console.log("marketable: " + theirItems[i].marketable)
			// console.log("Trading Card: " + (theirItems[i].tags[3].name === 'Trading Card'))
			console.log(theirItems[i])
			//if their item is a marketable trading card:
			if(theirItems[i].type.includes("Trading Card"))
			{
				if(theirItems[i].marketable == true && (theirItems[i].tags[3].name === 'Trading Card'))
				{
					theirValue += cardBuy;
				} else if(theirItems[i].marketable == false && (theirItems[i].tags[3].name === 'Trading Card'))
				{
					theirValue += cardBuyNMark;
				}
			}
			else if(theirItems[i].type.includes("Profile Background"))
			{
				if(theirItems[i].marketable == true && (theirItems[i].tags[3].name === 'Profile Background'))
				{
					theirValue += backGrBuy;
				}
			}
			else if(item === ("Sack of Gems"))
			{
				theirValue += sackGemBuy;
			}
			else if(ourItems[i].type.includes("Base Grade Container"))
			{
				ourValue += csCaseBuy;
			}
			else if(item in Prices) 
			{
				console.log("Our item present in Pricelist");
				ourValue += Prices[item].sell;	
			}else
			{
				console.log("Invalid Item ")
			}
		}
	}

/* - - - - - - - - - - - - - - - - - - BOT TRADE OFFER AREA - - - - - - - - - - - - - - - - - - */ 
		for (var i in ourItems) {
			var item = ourItems[i].market_name;	
			//if the item is a marketable trading card:
			//console.log(ourItems[i])
			if(ourItems[i].type.includes("Trading Card"))
			{
				if(ourItems[i].marketable == true && (ourItems[i].tags[3].name === 'Trading Card')) 
				{
						ourValue += cardBuy*2;
				} else if(ourItems[i].marketable == false && (ourItems[i].tags[3].name === 'Trading Card'))
				{
					theirValue += cardBuyNMark*2;
				}
			}
			else if(ourItems[i].type.includes("Profile Background"))
			{
				if(ourItems[i].marketable == true && (ourItems[i].tags[2].name === 'Profile Background'))
				{
					ourValue += backGrBuy*2;
				}
			}
			else if(item === ("Sack of Gems"))
			{
				ourValue += sackGemBuy*2;
			}
			else if(ourItems[i].type.includes("Base Grade Container"))
			{
				ourValue += csCaseBuy*2;
			}
			else if(item in Prices) 
			{
				console.log("Our item present in Pricelist");
				ourValue += Prices[item].sell;	
			}else
			{
				console.log("Invalid Item ")
				//console.log(ourItems[i]) //temp to check class of background and how to filter it out
				ourValue += 99999999999999;	//if item is not recognsed (unusual hat), we add 99999 to value so that trade prevented
			}			
		}

	console.log("Our value was " +ourValue)
	console.log("Their value was " +theirValue)

	if(ourValue <= theirValue) {
		acceptOffer(offer);
	} else{
		declineOffer(offer);
	}
}

//when new offer is received
manager.on('newOffer', (offer) => {
	console.log("new offer detected, processing...")
	processOffer(offer);
	//console.log(tf2.backpack)								
	retry = 2		
	while(retry != 1)								//value of retry will be changed within metalManager function in case bp not found
	{
		retry = metalManager.metalManager(tf2)		//5s delay is set within metalManager itself, if bp not found.checks new amount of metal
		console.log(retry)
		console.log("in while loop")
	}
	crafting.craftScrap(tf2)	//craft scrap if low
	crafting.craftRec(tf2)		//craft rec if low

});

//event listener to check connection to GameClient (tf2 GC started using gamesPlayed method([440]) above l35)
tf2.on('connectedToGC', () => {	
	console.log("Connected to tf2 game server")
	
});

//event listener to check if backpackLoaded 
tf2.on('backpackLoaded', () => {
	console.log("Loaded our backpack")
	metalManager.metalManager(tf2)	
	crafting.craftScrap(tf2)
	crafting.craftRec(tf2)
});

//check when crafting is complete
tf2.on('craftingComplete', (recipe,itemsGained) => {
	console.log("crafting complete")
	metalManager.metalManager(tf2)	
});



// var scrapAmt = config.scrapAmt;
// var pollCraft = config.pollCraft;

// tf2.on('connectedToGC', function() {
// 	console.log("Connected to tf2 game server.");
// });
 
// tf2.on('backpackLoaded', function () {
// 	console.log("Loaded our backpack.");
// });

// function craftS(amtNeedScrap) {
// 	if (tf2.backpack == undefined) {
// 		console.log("unable to load backpack, can't craft.");
// 		return
// 	} else {
// 		console.log("attempting to craft...");
// 		var amtOfScrap = 0;
// 		for (var i = 0; i <tf2.backpack.length; i++) {
// 			if (tf2.backpack[i].defIndex === 5000) {
// 				amtOfScrap++;
// 			}
// 		}
// 		for (var i = 0; i <tf2.backpack.length; i++) {
// 			if (tf2.backpack[i].defIndex === 5002) {
// 				amtOfScrap +=9;
// 				var beep = new Array;
// 				beep.push(parseInt(tf2.backpack[i].id));
// 				tf2.craft(beep);
 
// 	} else if (tf2.backpack[i].defIndex === 5001) {
// 				amtOfScrap +=3;
// 				var beep = new Array;
// 				beep.push(parseInt(tf2.backpack[i].id));
// 				tf2.craft(beep);
// 			}
// 			if (amtOfScrap >= amtNeedScrap) {
// 				break;
// 			}
// 		} 
// 	}
// }

// tf2.on('craftingComplete', function(e) {
// 	console.log("Finished crafting.");
// });

// client.on('friendMessage#'+config.kiblykat_ID, function(steamID, message) {
// 	if (message == "craft") {
// 		craftS(scrapAmt);
// 		console.log("Recieved order to craft from admin.")
// 	} else {
// 		console.log("craft error.")
// 	}
// });
 
// setInterval(function() {
// 	craftS(scrapAmt);
// }, 1000 * 60 * pollCraft)

