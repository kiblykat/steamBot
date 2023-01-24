const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require("steamcommunity");
const TradeOfferManager = require('steam-tradeoffer-manager');
const TeamFortress2 = require('tf2');


const config = require('./config.json');
const Prices = require('./prices.json');
const { RequestTF2FriendsResponse } = require('tf2/language');

const client = new SteamUser();
const tf2 = new TeamFortress2(client);
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
  client.setPersona(SteamUser.EPersonaState.LookingToTrade, 'little_john >Buying Trading Cards');
  client.gamesPlayed([440]);		//this is the code that starts the tf2 client and loads backpack, so that
});

//event listener for webSession: to start Confirmation Checker
client.on('webSession', (sessionid,cookies) =>{
	manager.setCookies(cookies);

	community.setCookies(cookies);
	community.startConfirmationChecker(5000, config.identitySecret);

	// sendRandomItem(); 	//executes the sendRandomItem method when webSession is started
});

//function used in newOffer event listener
function acceptOffer(offer){
	offer.accept((err) => {
		console.log("bot accepted an offer");
		if (err) console.log("there was an error accepting the offer");
	});
}

//function used in newOffer event listener
function declineOffer(offer){
	offer.decline((err) => {
		console.log("bot declined an offer");
		if (err) console.log("there was an error declining the offer");
	});
}

//function used in manager.on to process offers based on prices
function processOffer(offer){
	if (offer.isGlitched() || offer.state === 11 ){
		console.log("Offer was glitched, declining");
	} else if (offer.partner.getSteamID64() === config.ownerID) {
		acceptOffer(offer)
	} else {
		var ourItems = offer.itemsToGive;
		var theirItems = offer.itemsToReceive;
		var ourValue = 0;
		var theirValue = 0;

		for (var i in ourItems) {
			var item = ourItems[i].market_name;
			if(Prices[item]) {
				ourValue += Prices[item].sell;
			} else {
				console.log("Invalid Value. ");
				ourValue += 999999;
			}
		}

		for(var i in theirItems) {
			var item = theirItems[i].market_name;
			if(Prices[item]) {
				theirValue += Prices[item].buy;
			} else {
			console.log("Their value was different. ");
			}
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

manager.on('newOffer', (offer) => {
	processOffer(offer);
});

//* * * * * * CRAFTING * * * * * *//

var scrapAmt = config.scrapAmt;
var pollCraft = config.pollCraft;

//event listener to check connection to GameClient (tf2 GC started using gamesPlayed method([440]) above l35)
tf2.on('connectedToGC', () => {	
	console.log("Connected to tf2 game server")
});

//event listener to check if backpackLoaded 
tf2.on('backpackLoaded', () => {
	console.log("Loaded our backpack")
	craftScrap()
});

tf2.on('craftingComplete', (recipe,itemsGained) => {
	console.log("crafting complete")
	console.log(rec_list)
});

function craftScrap() 	//scrap= 5000, rec=5001, ref=5002
{
	//current metal in backpack
	scrapInBackpack = 0
	recInBackpack = 0
	refInBackpack = 0

	//expected metal in backpack
	scrapRequired = 9
	recRequired = 21
	refRequired = 40

	if (tf2.backpack == undefined)
	{
		console.log("Unable to load backpack, can't craft")
		return
	} else {
		//populate value for InBackpack
		count = 0;
		var backpack = tf2.backpack 	//backpack contains list 
		for(var i =0; i < backpack.length; i++)
		{
			switch(backpack[i].def_index){	//switch counter for number of each class of metal 
				case 5000:
					scrapInBackpack+=1
					break
				case 5001:
					recInBackpack+=1
					break
				case 5002:
					refInBackpack+=1	
					break
			}
			count+=1
		}
		console.log(`scrap: ${scrapInBackpack}`)
		console.log(`rec: ${recInBackpack}`)
		console.log(`ref: ${refInBackpack}`)
		// console.log(backpack)
		if(scrapInBackpack < scrapRequired)	//if (Scrap in BP) < (Scrap Amt we predetermine), then enter decision
		{
			//craft the difference scrapRequired - scrapInBackpack
			//craft rec to scrap
			rec_list = []	//stores the original_id for RECLAIMED
			diffScrap = scrapRequired - scrapInBackpack	//extra scrap needed
			recCraft = diffScrap/3	//number of rec required to be crafted into Scrap
			recCraft = Math.ceil(recCraft) //round UP the number of reclaimed needed

			for(var i =0; i < backpack.length; i++)
			{
				if(backpack[i].def_index == 5001) //if the item id is a rec
				{
					rec_list.push(backpack[i].id)
				}
				//save all recs in a list, use shift method to extract the original_id of the metal for crafting
			}
			console.log(rec_list)
			while(scrapInBackpack < scrapRequired)
			{
				if(rec_list.length>0) //if reclist doesnt return empty list
				{
					console.log("smelting reclaimed")
					tf2.craft([rec_list.shift()], 22)
					scrapInBackpack+=3					//this will update scrapValue in backpack, work as exit condition for while loop
				} else {
					console.log("no reclaimed to smelt")
				}
			}
		}
	}
}



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

