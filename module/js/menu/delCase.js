
import { sqlDeleteCase } from "../model/sqlDeleteCase.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"
import { viewDeleteCase } from "../view/viewDeleteCase.js"
import { clearSelection } from "../control/clearSelection.js"
import { doUndel } from "./allDeletedCases.js"
import { addrow } from "./addnewrow.js"

// not actually delete the case but set deleted = 1
// Remove the row if more than one case on that date, or on staff table
// Just blank the row if there is only one case
export function delCase() {
	let	selected = document.querySelector(".selected"),
		row = selected.closest('tr'),
		prevrow = row.previousElementSibling,
		opdate = row.dataset.opdate,
		qn = row.dataset.qn,
		oproom = row.dataset.oproom,
		allCases = []

	if (!qn) {
		row.remove()
	  clearSelection()
		return
	}

	if (oproom) {
		allCases = sameDateRoomTableQNs(opdate, row)
	}

	let deleteCase = function (del) {
		sqlDeleteCase(allCases, oproom, qn, del).then(response => {
			let hasData = function () {
				updateBOOK(response)
//				viewDeleteCase(row)
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
				doUndel(allCases, opdate, oproom, staffname, qn, 0)
			} else {
				addrow($prevrow)
			}
		},
		redo: function() {
			deleteCase(1)
		}
	})*/
}
