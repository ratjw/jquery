
import { UndoManager } from "../model/UndoManager.js"
import {
	OPDATE, THEATRE, OPROOM, STAFFNAME, QN, LARGESTDATE
} from "../model/const.js"
import { sqlPostponeCase } from "../model/sqlmove.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { BOOK, updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
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
		newwaitnum = getLargestWaitnum(staffname) + 1,
		allCases = []

	if (oproom) {
		allCases = sameDateRoomTableQNs(row)
	}

	let doPostponeCase = function (waitnum, thisdate) {
		sqlPostponeCase(allCases, waitnum, thisdate, oproom, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewPostponeCase(opdate, thisdate, staffname, qn)
			}

			typeof response === "object"
			? hasData()
			: Alert ("postponeCase", response)
		}).catch(error => {})
	}

    clearSelection()

	doPostponeCase(newwaitnum, LARGESTDATE)

/*	UndoManager.add({
		undo: function() {
			doPostponeCase(oldwaitnum, opdate)
		},
		redo: function() {
			doPostponeCase(newwaitnum, LARGESTDATE)
		}
	})*/
}

// The second parameter (, 0) ensure a default value if arrayAfter .map is empty
function getLargestWaitnum(staffname)
{
	let dateStaff = BOOK.filter(function(q) {
		return (q.staffname === staffname) && (q.opdate === LARGESTDATE)
	})

	return Math.max(...dateStaff.map(q => q.waitnum), 0)
}
