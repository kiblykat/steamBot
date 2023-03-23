# steamBot
include a config.json file in the src/utils folder, with your following personal data included, for the bot to work.
fill in the relevant fields below:
```
{
	"username":"abcd",
	"password":"abcd",
	"sharedSecret":"abcd", 
	"identitySecret":"abcd",
	"kiblykat_ID":"abcd",
	"scrapAmt":"25",
	"pollCraft":"35"
}
```

## src folder
 #### bot.js: main code is implemented here
 #### crafting.js: funciton logic for scrap and rec when reserves are low. min amount defined in metalManager
 #### metaManager.js: sets minimum amount of scrap and rec in inventory, prints out in console.
 #### package.json: npm related thingies, don't edit. auto-generated through "npm -i" on console
 #### package-lock.json:npm related thingies, don't edit. auto-generated through "npm -i" on console 
