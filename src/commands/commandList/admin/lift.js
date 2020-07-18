/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({

	alias:["lift"],

	admin:true,
	mod:true,
	dm:true,

	execute: async function(p){
		let penalty;
		if(p.global.isInt(p.args[1])){
			penalty = parseInt(p.args[1]);
		}

		if(!p.global.isUser("<@"+p.args[0]+">")){
			p.errorMsg(", Invalid user id");
			return;
		}
		let sql = "UPDATE IGNORE timeout SET time = "+new Date(0).toISOString().split('T')[0]; // set ban time to epoch
		if (penalty) {
			sql += `, penalty = ${penalty}`;
		}
		sql += " WHERE id = "+p.args[0]+";"
		let result = await p.query(sql);

		if(user = await p.sender.msgUser(p.args[0],"**🙇 |** Your penalty has been lifted by an admin! Sorry for the inconvenience!")) {
			let message = `Ban has been lifted for ${user.username}`;
			if (penalty) {
				message += `, penalty set to ${penalty} hours for future bans.`;
			}
			p.send(message);
		}
		else if(guild = await p.fetch.getGuild(p.args[0])) {
			let message = `Ban has been lifted for guild: ${guild.name}`;
			if (penalty) {
				message += `, penalty set to ${penalty} hours for future bans.`;
			}
			p.send(message);
		}
		else {
			p.send("If that was a user, they had DMs disabled; the ban was still lifted.  If it was a guild, the ban was not lifted.  Or it was neither and nothing happened.");
		}
	}

})
