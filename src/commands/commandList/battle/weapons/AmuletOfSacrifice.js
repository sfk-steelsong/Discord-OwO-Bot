/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const WeaponInterface = require('../WeaponInterface.js');
const battleUtil = require('../util/battleUtil.js');
const Logs = require('../util/logUtil.js');

module.exports = class AmuletOfSacrifice extends WeaponInterface{

	init(){
		this.id = 18;
		this.name = "Amulet of Sacrifice";
		this.basicDesc = "";
		this.emojis = ["<:amulet_1:689217012899119210>","<:amulet_1:689217012899119210>","<:amulet_1:689217012899119210>","<:amulet_1:689217012899119210>","<:amulet_1:689217012899119210>","<:amulet_1:689217012899119210>","<:amulet_1:689217012899119210>"];
		this.defaultEmoji = "<:amulet_1:689217012899119210>";
		this.statDesc = "Grants a **Life Link** buff to your allies for 2 turns.";
		this.availablePassives = "all";
		this.passiveCount = 1;
		this.qualityList = [];
		this.manaRange = [250,150];
		this.buffList = [10,11];
	}

	preTurn(animal,ally,enemy,action){
		if(action!=battleUtil.weapon)
			return;

		if(animal.disabled&&!animal.disabled.canAttack)
			return;

		/* If dead */
		if(animal.stats.hp[0]<=0) return;

		/* No mana */
		if(animal.stats.wp[0]<this.manaCost)
			return;

		/* check if we already have the buff or not */
		for(let i in animal.buffs)
			if(animal.buffs[i].id == this.buffList[0])
				return;

		let logs = new Logs();

		/* Grab buff and bind it to our animal */
		let subLogs = new Logs();
		let ga = this.getBuffs(animal)[0];
		let gaLogs = ga.bind(animal,2,{me:animal,allies:ally,enemies:enemy});
		subLogs.push(gaLogs);
		
		for(let i=0;i<ally.length;i++){
			if(ally[i].pid != animal.pid && ally[i].stats.hp[0]>0){
				// Apply buff
				let cover = this.getBuffs(animal)[1];
				let coverLogs = cover.bind(ally[i],2,{me:ally[i],allies:ally,enemies:enemy});
				subLogs.push(coverLogs);
			}
		}
		let logText = `[AOS] ${animal.nickname} used Guardian Angel`;

		logs.push(logText,subLogs);

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(animal,this.manaCost,animal,{me:animal,allies:ally,enemies:enemy});
		let manaLogs = new Logs();
		manaLogs.push(`[AOS] ${animal.nickname} used ${mana.amount} WP`,mana.logs);
		logs.addSubLogs(manaLogs);

		return logs
	}

	attackWeapon(me,team,enemy){
		/* Don't attack if we used an ability */
		for(let i in me.buffs)
			if(me.buffs[i].id == this.buffList[0]&&me.buffs[i].justCreated)
				return;
		return this.attackPhysical(me,team,enemy);
	}
}
