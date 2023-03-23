# steamBot
#### this TF2 bot allows you to automatically track and manage TF2 metal within your backpack, as well as auto-trade with other users based on a pricelist provided within the code. I have set it to trade CS cases, steam cards, backgrounds and emoticons at designated prices within the main code (bot.js).   

## Additional setup required

  #### 1. Config.json 
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
  #### 2. Steam Desktop Authenticator to work together with the config.json file
  #### 3. Node modules (download using command prompt "npm i (node module)".)

## src folder layout

 #### 1. bot.js: main code is implemented here. run code by typing "node bot.js" on command prompt.
 #### 2. crafting.js: function logic for scrap and rec when reserves are low. min amount defined in metalManager
 #### 3. metaManager.js: sets minimum amount of scrap and rec in inventory, prints out in console.
 #### 4. package.json: npm related thingies, don't edit. auto-generated through "npm -i" on console
 #### 5. package-lock.json:npm related thingies, don't edit. auto-generated through "npm i" on console 
