
import {
	OPROOM, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS,
	TREATMENT, CONTACT
} from "../model/const.js"
import { getBOOKrowByQN, getTableRowByQN } from "../util/getrows.js"
import { putNameAge } from "../util/date.js"
import { BOOK } from "../util/variables.js"

// view corresponding cell in another table
export function refillAnotherTableCell(tableID, cellindex, qn) {
	let q = getBOOKrowByQN(BOOK, qn),
		row = getTableRowByQN(tableID, qn),
		cells = row.cells,
		viewcell = {
			OPROOM: q.oproom || "",
			CASENUM: q.casenum || "",
			STAFFNAME: q.staffname,
			HN: q.hn,
			PATIENT: putNameAge(q),
			DIAGNOSIS: q.diagnosis,
			TREATMENT: q.treatment,
			CONTACT: q.contact
		}

	if (!q || !row) { return }
	if (cellindex === HN) {
		cells[HN].innerHTML = viewcell[HN]
		cells[PATIENT].innerHTML = viewcell[PATIENT]
	} else {
		cells[cellindex].innerHTML = viewcell[cellindex]
	}
}
