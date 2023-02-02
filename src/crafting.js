/* this file is used to craft scrap and rec when reserves are low. The minimum 
   amount of metal required to be present in the backpack is defined in metalManager */


function craftScrapFunc(tf2) 	//scrap= 5000, rec=5001, ref=5002
{
	if(scrapInBackpack < scrapRequired)	//if (Scrap in BP) < (Scrap Amt we predetermine), then enter decision
	{
		//craft the difference scrapRequired - scrapInBackpack
		//craft rec to scrap
		console.log("Scrap reserves low... crafting Scrap")
		rec_list = []	//stores the original_id for RECLAIMED
		diffScrap = scrapRequired - scrapInBackpack	//extra scrap needed
		recCraft = diffScrap/3	//number of rec required to be crafted into Scrap
		recCraft = Math.ceil(recCraft) //round UP the number of reclaimed needed

		for(var i =0; i < tf2.backpack.length; i++)							//CURRENT ERROR GETTING THROWN HERE
		{
			if(tf2.backpack[i].def_index == 5001) //if the item id is a rec
			{
				rec_list.push(tf2.backpack[i].id)
			}
			//save all recs in a list, use shift method to extract the original_id of the metal for crafting
		}
		console.log(rec_list)
		while(scrapInBackpack < scrapRequired)
		{
			if(rec_list.length>0) //if reclist doesnt return empty list
			{
				console.log("smelting Reclaimed...")
				tf2.craft([rec_list.shift()], 22)
				scrapInBackpack+=3					//this will update scrapValue in backpack, work as exit condition for while loop
			} else {
				console.log("No Reclaimed to smelt")
			}
		}
	}
}

function craftRecFunc(tf2) 	//scrap= 5000, rec=5001, ref=5002
{
	if(recInBackpack < recRequired)	//if (Scrap in BP) < (Scrap Amt we predetermine), then enter decision
	{
		//craft the difference scrapRequired - scrapInBackpack
		//craft rec to scrap
		console.log("Reclaimed reserves low...")
		ref_list = []	//stores the original_id for RECLAIMED
		diffRec = recRequired - recInBackpack	//extra scrap needed
		refCraft = diffRec/3	//number of rec required to be crafted into Scrap
		refCraft = Math.ceil(refCraft) //round UP the number of reclaimed needed

		for(var i =0; i < tf2.backpack.length; i++)
		{
			if(tf2.backpack[i].def_index == 5002) //if the item id is a ref
			{
				ref_list.push(tf2.backpack[i].id)
			}
			//save all refs in a list, use shift method to extract the original_id of the metal for crafting
		}
		//console.log(ref_list)
		while(recInBackpack < recRequired)
		{
			if(ref_list.length>0) //if reclist doesnt return empty list
			{
				console.log("Smelting refined...")
				tf2.craft([ref_list.shift()], 23)	//23 = smelt ref recipe
				recInBackpack+=3					//this will update scrapValue in backpack, work as exit condition for while loop
			} else {
				console.log("no ref left to smelt")
			}
		}
	}
}

module.exports.craftScrap = craftScrapFunc;
module.exports.craftRec = craftRecFunc;
