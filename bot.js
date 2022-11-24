const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const config = require('./config.json');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language : 'en'
});

const logOnOptions = {
  accountName: config.username,
  password: config.password,
  twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
  console.log('Logged into Steam');
  client.setPersona(SteamUser.EPersonaState.Online);
  client.gamesPlayed([730]);
});

client.on('webSession', (sessionid,cookies) =>{
	manager.setCookies(cookies);
	community.setCookies(cookies);
	community.startConfirmationChecker(20000, config.identitySecret);
});

function acceptOffer(offer){
	offer.accept((err) => {
		if (err) console.log("there was an error accepting the offer");
	});
}

function declineOffer(offer){
	offer.decline((err) => {
		if (err) console.log("there was an error declining the offer");
	});
}

manager.on('newOffer', (offer) => {
	if (offer.partner.getSteamID64() == config.ownerID) {
		acceptOffer(offer);
	}else {
		declineOffer(offer);
	}
})