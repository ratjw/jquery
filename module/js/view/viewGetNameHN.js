
import { HN, PATIENT, STAFFNAME, DIAGNOSIS, TREATMENT, CONTACT, QN } from "../model/const.js"
import { isSplit, isStaffname, isConsults, isConsultsTbl, getMaxQN } from "../util/util.js"
import { BOOK, CONSULT, isPACS } from "../util/variables.js"
import { getBOOKrowByQN } from "../util/rowsgetting.js"
import { putNameAge } from "../util/date.js"
import { refillall } from "./fill.js"
import { fillConsults } from "./fillConsults.js"
import { refillAnotherTableCell } from "./refillAnotherTableCell.js"
import { reCreateEditcell } from "../control/edit.js"

export function viewGetNameHN(pointed) {
	let tableID = pointed.closest("table").id,
		row = pointed.closest('tr'),
		opdate = row.dataset.opdate,
		staffname = row.dataset.staffname,
		qn = row.dataset.qn,
		noqn = !qn,
		cellindex = pointed.cellIndex,
		book = (isConsultsTbl(tableID)) ? CONSULT : BOOK

	// New case input
	if (noqn) {
		qn = getMaxQN(book)
		row.dataset.qn = qn
	}

	let bookq = getBOOKrowByQN(book, qn)

	if (isPACS) { $cells[HN].className = "pacs" }
	$cells[PATIENT].className = "upload"
	$cells[STAFFNAME].innerHTML = bookq.staffname
	$cells[HN].innerHTML = bookq.hn
	$cells[PATIENT].innerHTML = putNameAge(bookq)
	$cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	$cells[TREATMENT].innerHTML = bookq.treatment
	$cells[CONTACT].innerHTML = bookq.contact

	// Both cases remote effect -> refill corresponding cell
	// no need to refillall main table because new case row was already there
	// Consults cases are not shown in main table
	if (tableID === 'tbl') {
		if (isSplit() && isStaffname(staffname)) {
			refillAnotherTableCell('queuetbl', cellindex, qn)
		}
	} else {
		if (!isConsults()) {
			if (noqn) {
				refillall()
				fillConsults()
			} else {
				refillAnotherTableCell('tbl', cellindex, qn)
			}
		}
	}

	reCreateEditcell()
}
