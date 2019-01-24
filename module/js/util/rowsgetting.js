
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

export function getBOOKRowsByDate(book, opdate)
{
	return book.filter(q => q.opdate === opdate)
}

// main table (#tbl) only
export function getTableRowsByDate(opdateth)
{
	if (!opdateth) { return [] }
	return $("#tbl tr").filter(function() {
		return this.cells[OPDATE].innerHTML === opdateth;
	})
}

export function sameDateRoomBOOKQNs(book, row)
{
	let rows = book.filter(q => {
		return q.opdate === row.opdate
			 &&	q.theatre === row.theatre
			 &&	q.oproom === row.oproom
	})

  return Array.from(rows).map(e => e.qn)
}
// main table (#tbl) only
export function sameDateRoomTableQNs(opdateth, room, theatre)
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
  // remove empty value
	return Array.from(sameRoom).filter(e => e)
}
