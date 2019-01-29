
import { OPDATE, THEATRE, OPROOM, QN } from "../model/const.js"

export function getBOOKrowByQN(book, qn) {  
	return book.find(q => q.qn === qn )
}

export function getTableRowByQN(tableID, qn)
{
	return $("#"+tableID+" tr:has(td)")
				.toArray()
				.find(row => row.dataset.qn === qn)
}

// main table (#tbl) only
export function getTableRowsByDate(opdate)
{
	return Array.from(document.querySelectorAll("#tbl tr"))
            .filter(e => e.dataset.opdate === opdate)
}

// main table (#tbl) only
// remove empty value
export function sameDateRoomTableQNs(row)
{
	return sameDateRoomTableRows(row).map(e => e.dataset.qn).filter(e => e)
}

// main table (#tbl) only
export function sameDateRoomTableRows(row)
{
	return Array.from(document.querySelectorAll('#tbl tr')).filter(e => {
		return e.dataset.opdate === row.dataset.opdate
			&& e.dataset.theatre === row.dataset.theatre
			&& e.dataset.oproom === row.dataset.oproom;
	})
}
