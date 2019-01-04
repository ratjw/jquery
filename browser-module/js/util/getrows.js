
import { OPDATE, THEATRE, OPROOM, QN } from "../model/const.js"

export function getBOOKrowByQN(book, qn) {  
	return book.find(row => row.qn === qn )
}

export function getTableRowByQN(tableID, qn)
{
	return $("#"+tableID+" tr:has(td)")
				.toArray()
				.find(row => row.cells[QN].innerHTML === qn)
}

export function getBOOKrowsByDate(book, opdate)
{
	return book.filter(function(q) {
		return (q.opdate === opdate);
	})
}

// main table (#tbl) only
export function getTableRowsByDate(opdateth)
{
	if (!opdateth) { return [] }
	return $("#tbl tr").filter(function() {
		return this.cells[OPDATE].innerHTML === opdateth;
	})
}

// main table (#tbl) only
export function sameDateRoomTableQN(opdateth, room, theatre)
{
	if (!opdateth) { return [] }

	var sameRoom = $('#tbl tr').filter(function() {
		return this.cells[OPDATE].innerHTML === opdateth
			&& this.cells[THEATRE].innerHTML === theatre
			&& this.cells[OPROOM].innerHTML === room;
	})
	$.each(sameRoom, function(i) {
		sameRoom[i] = this.cells[QN].innerHTML
	})
	return $.makeArray(sameRoom)
}
