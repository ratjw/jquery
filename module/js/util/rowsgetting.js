
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
	return Array.from(document.querySelectorAll("#tbl tr"))
            .filter(e => e.cells[OPDATE].innerHTML === opdateth)
}

export function sameDateRoomBOOKQNs(book, row)
{
	return book.filter(q => {
		return q.opdate === row.opdate
			 &&	q.theatre === row.theatre
			 &&	q.oproom === row.oproom
	}).map(e => e.qn)
}

// main table (#tbl) only
export function sameDateRoomTableQNs(row)
{
	return Array.from(document.querySelectorAll('#tbl tr')).filter(e => {
		return e.opdate === row.opdate
			&& e.theatre === row.theatre
			&& e.oproom === row.oproom;
	}).map(e => e.qn).filter(e => e)
  // remove empty value
}

export function sameDateRoomBOOKRows(book, row)
{
	return book.filter(q => {
		return q.opdate === row.opdate
			 &&	q.theatre === row.theatre
			 &&	q.oproom === row.oproom
	})
}
