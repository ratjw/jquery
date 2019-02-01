
import { UndoManager } from "../model/UndoManager.js"
import { LARGESTDATE } from "../model/const.js"
import { sqlPostponeCase } from "../model/sqlPostponeCase.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { BOOK, updateBOOK } from "../util/variables.js"
import { Alert, getLargestWaitnum } from "../util/util.js"
import { viewPostponeCase } from "../view/viewPostponeCase.js"
import { clearSelection } from "../control/clearSelection.js"

// Undefined date booking has opdate set to LARGESTDATE
// but was shown blank date on screen
export function postponeCase()
{
	let	selected = document.querySelector(".selected"),
		tableID = selected.closest('table').id,
		row = selected.closest('tr'),
		opdate = row.dataset.opdate,
		oproom = row.dataset.oproom,
		staffname = row.dataset.staffname,
		qn = row.dataset.qn,
		oldwaitnum = row.dataset.waitnum,
		newwaitnum = Math.ceil(getLargestWaitnum(BOOK, movestaffname)) + 1,
		allCases = []

	if (oproom) {
		allCases = sameDateRoomTableQNs(row)
	}

	doPostponeCase(newwaitnum, LARGESTDATE)
  clearSelection()

	function doPostponeCase(waitnum, thisdate) {
		sqlPostponeCase(allCases, row, thisdate).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewPostponeCase(row, thisdate)
			}

			typeof response === "object"
			? hasData()
			: Alert ("postponeCase", response)
		}).catch(error => {})
	}
/*
	UndoManager.add({
		undo: function() {
			doPostponeCase(oldwaitnum, opdate)
		},
		redo: function() {
			doPostponeCase(newwaitnum, LARGESTDATE)
		}
	})*/
}
