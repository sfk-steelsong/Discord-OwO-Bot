/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class GuardianAngel extends BuffInterface{

	init(){
		this.id = 10;
		this.name = "Guardian Angel";
		this.debuff = false;
		this.emoji = "<:protect_3:689135686653050986>";
		this.statDesc = "This animal will take a percentage of damage inflicted to other pets on your team!";
		this.qualityList = [];
	}
}
