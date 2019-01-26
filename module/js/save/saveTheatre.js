
import { OPDATE, THEATRE, OPROOM, CASENUM, QN } from "../model/const.js"
import { fetchSaveTheatre } from "../model/sqlsavedata.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewOneDay } from "../view/viewOneDay.js"
import { viewSplit } from "../view/viewSplit.js"

export function saveTheatre(pointed, newcontent)
{
	let	row = pointed.closest("tr"),
		opdate = row.opdate,
		theatre = row.theatre,
		oproom = row.oproom,
		casenum = row.casenum,
		qn = row.qn,
		allOldCases = [],
		allNewCases = []

	allOldCases = sameDateRoomTableQNs(opdate, oproom, theatre)
	allOldCases = allOldCases.filter(e => e !== qn)

	allNewCases = sameDateRoomTableQNs(opdate, oproom, newcontent)
	if (casenum) {
		allNewCases.splice(casenum-1, 0, qn)
	} else {
		allNewCases.push(qn)
	}

	fetchSaveTheatre(allOldCases, allNewCases, newcontent, oproom, qn).then(response => {
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
