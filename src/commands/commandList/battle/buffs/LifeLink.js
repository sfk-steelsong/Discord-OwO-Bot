/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class LifeLink extends BuffInterface{

	init(){
		this.id = 11;
		this.name = "Life Link";
		this.debuff = false;
		this.emoji = "<:protect_7:689135686829211675>";
		this.statDesc = "Guardian Angel will take **?%** of damage taken by this animal.";
		this.qualityList = [[30,50]];
	}

	attacked(animal,attacker,damage,type,tags){
		/* Ignore if tags.covered flag is true */
		if(tags.lifeLink) return;
		let redirect = (damage[0]+damage[1])*this.stats[0]/100;
		if(redirect < 1) return;

		let logs = new Logs();
		
		damage[1] -= redirect;
		
		let dmg = WeaponInterface.inflictDamage(this.from,attacker,redirect,type,{...tags,lifeLink:true});

		logs.push(`[GA] ${this.from.nickname} protected ${animal.nickname} for ${Math.round(redirect)} HP`, dmg.logs);

		return logs;
	}
}
