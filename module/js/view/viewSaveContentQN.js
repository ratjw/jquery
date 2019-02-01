
import { reCreateEditcell } from "../control/edit.js"
import { viewOneDay } from "./viewOneDay.js"
import { isSplit, isConsults } from "../util/util.js"
import { refillAnotherTablerow } from "./refillAnotherTablerow.js"
import { refillstaffqueue } from "./fill.js"
import { getOpdate } from "../util/date.js"
import { getBOOKrowByQN } from "../util/rowsgetting.js"
import { filldata } from "./fill.js"
import { BOOK } from "../util/variables.js"

export function viewSaveContentQN(pointed, column, oldcontent) {
	let	tableID = pointed.closest("table").id,
		row = pointed.closest('tr'),
		opdate = row.dataset.opdate,
		staffname = row.dataset.staffname,
		qn = row.dataset.qn,
    bookq = getBOOKrowByQN(BOOK, qn),
		titlename = document.getElementById('titlename').innerHTML

  filldata(row, bookq)

	if ((column === "oproom") || (column === "casenum")) {
		viewOneDay(opdate)
		refillstaffqueue()
	}

	if (tableID === 'tbl') {
		// Remote effect from editing on tbl to queuetbl
		if (isSplit()) {
			// this staffname is changed to another staff or to this staffname
			if ((oldcontent === titlename) || (pointed.innerHTML === titlename)) {
					refillstaffqueue()
			} else {
				// input is not staffname, but on this titlename row
				if (titlename === staffname) {
					refillAnotherTablerow('queuetbl', qn)
				}
			}
		}
	} else {
		// consults are not apparent on tbl, no remote effect from editing on queuetbl
		if (!isConsults()) {
			refillAnotherTablerow('tbl', qn)
		}
	}

	reCreateEditcell()
}
