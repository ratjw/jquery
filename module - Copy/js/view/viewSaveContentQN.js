
import { OPDATE, STAFFNAME, QN } from "../model/const.js"
import { reCreateEditcell } from "../control/edit.js"
import { viewOneDay } from "./viewOneDay.js"
import { isSplit, isConsults } from "../util/util.js"
import { refillAnotherTableCell } from "./refillAnotherTableCell.js"
import { refillstaffqueue } from "./fill.js"
import { getOpdate } from "../util/date.js"

export function viewSaveContentQN(pointed, column, oldcontent) {
	let	cellindex = pointed.cellIndex,
		tableID = $(pointed).closest("table").attr("id"),
		$cells = $(pointed).closest('tr').children("td"),
		opdate = getOpdate($cells[OPDATE].innerHTML),
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		titlename = $('#titlename').html()

	let onMaintable = function () {

		// Remote effect from editing on tbl to queuetbl
		// Staffqueue is showing
		if (isSplit()) {

			// this staffname is changed to another staff or to this staffname
			if ((oldcontent === titlename) || (pointed.innerHTML === titlename)) {
					refillstaffqueue()
			} else {
				// input is not staffname, but on this titlename row
				if (titlename === staffname) {
					refillAnotherTableCell('queuetbl', cellindex, qn)
				}
			}
		}
	}

	let onStafftable = function () {

		// staffname is changed to other staff => re-render
		if ((column === "staffname") && !isConsults()) {
			refillstaffqueue()
		}

		// consults are not apparent on tbl, no remote effect from editing on queuetbl
		// Remote effect from editing on queuetbl to tbl
		// view corresponding row
		if (!isConsults()) {
			refillAnotherTableCell('tbl', cellindex, qn)
		}
	}

	if ((column === "oproom") || (column === "casenum")) {
		viewOneDay(opdate)
		refillstaffqueue()
	}

	tableID === 'tbl' ? onMaintable() : onStafftable()

	reCreateEditcell()
}
