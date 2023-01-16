const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require("steamcommunity");
const TradeOfferManager = require('steam-tradeoffer-manager');
const config = require('./config.json');
const Prices = require('./prices.json');

const client = new SteamUser();
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
client.logOn(logOnOptions);

//event listener for logOn: sets persona + name, starts games
client.on('loggedOn', () => {
  console.log('Logged into Steam');
  client.setPersona(SteamUser.EPersonaState.LookingToTrade, 'little_john Buying Trading Cards');
  //client.gamesPlayed([440, 730]);
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

//event listener for 'newOffer' event: accept/decline offer . . . . . $(selector).on(-'event'-,childSelector,data,-function-,map). -compulsory-
manager.on('newOffer', (offer) => {
	if (offer.partner.getSteamID64() == config.kiblykat_ID) {
		acceptOffer(offer);
	}else {
		declineOffer(offer);
	}
});


// function sendRandomItem() {
// 	const partner = config.kiblykat_ID;
// 	const appid = 440;
// 	const contextid = 2;
  
// 	let offer = manager.createOffer(partner);
  
// 	manager.loadInventory(appid, contextid, true, (err, myInv) => {
// 	  if (err) {
// 		console.log(err);
// 	  } else {
// 		const myItem = myInv[Math.floor(Math.random() * myInv.length - 1)];
// 		offer.addMyItem(myItem);
  
// 		manager.loadUserInventory(
// 		  partner,
// 		  appid,
// 		  contextid,
// 		  true,
// 		  (err, theirInv) => {
// 			if (err) {
// 			  console.log(err);
// 			} else {
// 			  const theirItem =
// 				theirInv[Math.floor(Math.random() * theirInv.length - 1)];
// 			  offer.addTheirItem(theirItem);
  
// 			  offer.setMessage(
// 				`Will you trade your ${theirItem.name} for my ${myItem.name}?`
// 			  );
// 			  offer.send((err, status) => {
// 				if (err) {
// 				  console.log(err);
// 				} else {
// 				  console.log(`Sent offer. Status: ${status}.`);
// 				}
// 			  });
// 			}
// 		  }
// 		);
// 	  }
// 	});
//   }

//* * * * * * * * * * * * * ORIGINAL CODE FOR ACCEPTING OFFER * * * * * * * * * * * * * * * * *
// manager.on('newOffer', offer => {
// 	if (offer.partner.getSteamID64() === config.kiblykat_ID) {
// 	offer.accept((err, status) => {
// 		if (err) {
// 		console.log(err);
// 		} else {
// 		console.log(`Accepted offer. Status: ${status}.`);
// 		}
// 	});
// 	}
// });
