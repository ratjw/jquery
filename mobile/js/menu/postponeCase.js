
import { UndoManager } from "../model/UndoManager.js"
import {
	OPDATE, THEATRE, OPROOM, STAFFNAME, QN, LARGESTDATE
} from "../model/const.js"
import { fetchPostponeCase } from "../model/move.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQN } from "../util/getrows.js"
import { BOOK, updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewPostponeCase } from "../view/viewPostponeCase.js"
import { clearSelection } from "../control/clearSelection.js"

// Undefined date booking has opdate = LARGESTDATE
// but was shown blank date on screen
export function postponeCase()
{
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		qn = $cell.eq(QN).html(),
		theatre = $cell.eq(THEATRE).html(),
		oproom = $cell.eq(OPROOM).html(),
		oldwaitnum = $row[0].title,
		newwaitnum = getLargestWaitnum(staffname) + 1,
		allCases = []

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	}

	let doPostponeCase = function (waitnum, thisdate) {
		fetchPostponeCase(allCases, waitnum, thisdate, qn).then(response => {
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

// The second parameter (, 0) ensure a default value if arrayAfter.map is empty
function getLargestWaitnum(staffname)
{
	let dateStaff = BOOK.filter(function(patient) {
		return patient.staffname === staffname && patient.opdate === LARGESTDATE
	})

	return Math.max(...dateStaff.map(patient => patient.waitnum), 0)
}
