/* this file is used to set the minimum amount of scrap and rec to be available in our inventory */


function metalManagerFunc(tf2)	//run this before crafting, loads backpack and checks/manages metal.
{
	//current metal in backpack
	scrapInBackpack = 0
	recInBackpack = 0
	refInBackpack = 0

	//expected metal in backpack
	scrapRequired = 14
	recRequired = 20
	refRequired = 40

    // console.log("hello metalManager", tf2);

	if (tf2.backpack == undefined)
	{
		setTimeout(()=> {
			console.log("Unable to load backpack, retrying...")
		}, 5000);
		return 0						//0 value used to detect fail condition, to create retry mechanism in bot.js
	} else {
		//populate value for _InBackpack
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
		console.log(`Scrap: ${scrapInBackpack}`)
		console.log(`Rec: ${recInBackpack}`)
		console.log(`Ref: ${refInBackpack}`)

		if(refInBackpack < refRequired)
		{
			console.log(`REFINED STOCK LOW!! CRAFT MORE PL0X. Minimum ref defined: ${refRequired}`)
		}
	}
	return 1				//1 value used to detect pass condition, to exit retry mechanism in bot.js
}

module.exports.metalManager = metalManagerFunc;