
import { UndoManager } from "../model/UndoManager.js"
import { OPDATE, THEATRE, OPROOM, STAFFNAME, QN } from "../model/const.js"
import { fetchDeleteCase } from "../model/search.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQN } from "../util/getrows.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewDeleteCase } from "../view/viewDeleteCase.js"
import { clearSelection } from "../control/clearSelection.js"
import { doUndel } from "./deletedCases.js"
import { addrow } from "./addnewrow.js"

// not actually delete the case but set deleted = 1
// Remove the row if more than one case on that date, or on staff table
// Just blank the row if there is only one case
export function delCase() {
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$prevrow = $row.prev(),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		qn = $cell.eq(QN).html(),
		theatre = $cell.eq(THEATRE).html(),
		oproom = $cell.eq(OPROOM).html(),
		allCases = []

	if (!qn) {
		$row.remove()
		return
	}

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	}

	let deleteCase = function (del) {
		fetchDeleteCase(allCases, oproom, qn, del).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewDeleteCase(tableID, $row, opdate, staffname)
			}

			typeof response === "object"
			? hasData()
			: Alert ("delCase", response)
		}).catch(error => {})
	}

	clearSelection()
	deleteCase(1)

/*	UndoManager.add({
		undo: function() {
			if (qn) {
				doUndel(allCases, opdate, staffname, qn, 0)
			} else {
				addrow($prevrow)
			}
		},
		redo: function() {
			deleteCase(1)
		}
	})*/
}
