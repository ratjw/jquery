
import { OPDATE, STAFFNAME, QN } from "../model/const.js"
import { viewSplit } from "./viewSplit.js"
import { viewOneDay } from "./viewOneDay.js"
import { isConsults, isConsultsTbl } from "../util/util.js"
import { BOOK, CONSULT } from "../util/variables.js"
import { refillstaffqueue } from "./fill.js"
import { getOpdate } from "../util/date.js"

export function viewSaveContentNoQN(pointed, column) {
	let tableID = pointed.closest("table").id,
		row = pointed.closest('tr'),
		opdate = row.dataset.opdate,
		staffname = row.dataset.staffname,
		qn = row.dataset.qn,

		// find qn of new case input in that row, either tbl or queuetbl
		// fill qn in the blank QN
		book = (isConsultsTbl(tableID))? CONSULT : BOOK

	let onMaintable = function () {
		// delete staffoncall
		if (/(<([^>]+)>)/i.test(staffname)) {
			row.cells[STAFFNAME].innerHTML = ""
		} else {
			// Remote effect from editing on tbl to queuetbl
			// Staffqueue is showing, re-render to have new case of this staffname
			viewSplit(staffname)
		}
	}

	let onStafftable = function () {

		// staffname is changed to other staff => re-render to drop the case
		(column === "staffname") && !isConsults() && refillstaffqueue()

		// consults are not apparent on tbl, no remote effect from editing on queuetbl
		// Remote effect from editing on queuetbl to tbl
		// view the entire day, not just refillAnotherTableCell
		if (!isConsults()) { viewOneDay(opdate) }
	}

	qn = Math.max.apply(Math, book.map(q => q.qn))
	row.dataset.qn = qn

	tableID === 'tbl' ? onMaintable() : onStafftable()
}
