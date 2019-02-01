
import { sqlSaveTheatre } from "../model/sqlSaveTheatre.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewOneDay } from "../view/viewOneDay.js"
import { viewSplit } from "../view/viewSplit.js"

export function saveTheatre(pointed, newcontent)
{
	let	row = pointed.closest("tr"),
		opdate = row.dataset.opdate,
		oproom = row.dataset.oproom,
		casenum = row.dataset.casenum,
		qn = row.dataset.qn,
		allOldCases = [],
		allNewCases = []

	allOldCases = sameDateRoomTableQNs(row)
	allOldCases = allOldCases.filter(e => e !== qn)

	row.dataset.theatre = newcontent
  allNewCases = sameDateRoomTableQNs(row)
  allNewCases.splice(allNewCases.indexOf(qn), 1)
	if (casenum) {
		allNewCases.splice(casenum-1, 0, qn)
	} else {
		allNewCases.push(qn)
	}

	sqlSaveTheatre(allOldCases, allNewCases, newcontent, oproom, qn).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewOneDay(opdate)
			viewSplit(staffname)
		}

		typeof response === "object"
		? hasData()
		: Alert ("saveTheatre", response)
	})
}
