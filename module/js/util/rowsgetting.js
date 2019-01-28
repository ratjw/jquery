
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
export function getTableRowsByDate(opdate)
{
	return Array.from(document.querySelectorAll("#tbl tr"))
            .filter(e => e.opdate === opdate)
}

// main table (#tbl) only
// remove empty value
export function sameDateRoomTableQNs(row)
{
	return sameDateRoomTableRows(row).map(e => e.qn).filter(e => e)
}

// main table (#tbl) only
export function sameDateRoomTableRows(row)
{
	return Array.from(document.querySelectorAll('#tbl tr')).filter(e => {
		return e.opdate === row.opdate
			&& e.theatre === row.theatre
			&& e.oproom === row.oproom;
	})
}
