/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const config = require('../../../../data/config.json');
const items = {
	common_tickets: {
		id: 10,
		name: "Common Tickets",
		emoji: config.emoji.perkTicket.common,
		column: "common_tickets"
	}
};

exports.getItems = async function(p){
	let sql = `SELECT items.* FROM items INNER JOIN user ON items.uid = user.uid WHERE user.id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	if(!result[0]){return {}}

	let inv = {};

	for(let key in items){
		if (result[0][key]) {
			const count = result[0][key]
			const info = items[key]

			inv[info.id] = {
				id: info.id,
				emoji: info.emoji,
				count: count
			};
		}
	}
	
	return inv;
}

exports.use = async function (id, p) {
	let item = getById(id);
	switch (item?.id) {
		case 10:
			await useCommonTicket(item, p);
			break;
		default:
			await p.errorMsg(", something went wrong using this item... :(");
	}
}

function getById (id) {
	return Object.values(items).find(item => item.id == id)
}

async function useCommonTicket (ticket, p) {
	let count = p.args[1];
	if (!count) {
		count = 1;
	} else if (count == "all") {
		let result = await p.query(`SELECT ${ticket.column} FROM items INNER JOIN user ON items.uid = user.uid WHERE user.id = ${p.msg.author.id}`);
		if (!result[0] || result[0][ticket.column] < 0) {
			p.errorMsg(", you do not have this item!", 3000);
			return;
		}
		count = result[0][ticket.column];
	} else if (p.global.isInt(count)) {
		count = parseInt(count);
	} else {
		p.errorMsg(", invalid arguments! Please specify the number of tickets you want to use >:c", 3000);
		return;
	}

	if (count < 0) {
		p.errorMsg(", bad! You must use at least one ticket", 3000);
		return;
	}

	const con = await p.startTransaction();
	let date;
	try {
		// remove tickets
		let sql = `UPDATE items INNER JOIN user ON items.uid = user.uid SET ${ticket.column} = ${ticket.column} - ${count}  WHERE user.id = ${p.msg.author.id} AND ${ticket.column} >= ${count};`
		let result = await con.query(sql);
		if (!result.changedRows) {
			await con.commit();
			try { await p.errorMsg(", you do not have enough tickets silly!", 3000); } catch (err) {}
			return;
		}

		// add months
		sql = `SELECT user.uid, patreonMonths, patreonTimer, TIMESTAMPDIFF(MONTH,patreonTimer,NOW()) AS monthsPassed, patreonType FROM user LEFT JOIN patreons ON user.uid = patreons.uid WHERE id = ${p.msg.author.id}`;
		result = await p.query(sql);
		let uid = result[0].uid;
		let months = result[0]?.patreonMonths || 0;
		let monthsPassed = result[0]?.monthsPassed || months;
		const type = 1

		// reset timer or continue with current timer
		if (months <= monthsPassed) {
			sql = `INSERT INTO patreons (uid,patreonMonths,patreonType) VALUES (${uid},${count},${type}) ON DUPLICATE KEY UPDATE patreonType = ${type}, patreonMonths = ${count},patreonTimer = NOW();`;
			date = new Date();
			date.setMonth(date.getMonth()+count);
		} else {
			sql = `UPDATE patreons SET patreonType = ${type}, patreonMonths = patreonMonths + ${count} WHERE uid = ${uid};`;
			date = new Date(result[0].patreonTimer);
			date.setMonth(date.getMonth()+count+months);
		}
		date = date.toString();
		result = await p.query(sql);

		con.commit();
	} catch (err) {
		console.error(err);
		p.errorMsg(", there was an error using your ticket! Please try again later.", 3000);
		con.rollback();
		return;
	}

	await p.replyMsg(ticket.emoji, `, your patreon has been extended by ${count} month${count > 1 ? 's' : ''}!\n${p.config.emoji.blank} **|** Expires on: **${date}**`);
}
