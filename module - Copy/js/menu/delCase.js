
//import { UndoManager } from "../model/UndoManager.js"
import { OPDATE, THEATRE, OPROOM, STAFFNAME, QN } from "../model/const.js"
import { fetchDeleteCase } from "../model/sqlsearch.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomBOOKQNs } from "../util/rowsgetting.js"
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
	let	selected = document.querySelector(".selected"),
		tableID = selected.closest('table').id,
    table = document.getElementById(tableID),
		row = selected.closest('tr'),
		prevrow = row.previousElementSibling,
		opdate = row.opdate,
		qn = row.qn,
		oproom = row.oproom,
		allCases = []

	if (!qn) {
		table.deleteRow(row.rowIndex)
	  clearSelection()
		return
	}

	if (oproom) {
		allCases = sameDateRoomBOOKQNs(opdate, row)
	}

	let deleteCase = function (del) {
		fetchDeleteCase(allCases, oproom, qn, del).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewDeleteCase(tableID, row)
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
