
import { OPDATE, THEATRE, OPROOM, CASENUM, QN } from "../model/const.js"
import { fetchSaveTheatre } from "../model/savedata.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQN } from "../util/getrows.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewOneDay } from "../view/viewOneDay.js"
import { viewSplit } from "../view/viewSplit.js"

export function saveTheatre(pointed, newcontent)
{
	let	$cell = $(pointed).closest("tr").find("td"),
		opdateth = $cell[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cell[THEATRE].innerHTML,
		oproom = $cell[OPROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cell[QN].innerHTML,
		allOldCases = [],
		allNewCases = []

	allOldCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	allOldCases = allOldCases.filter(e => e !== qn)

	allNewCases = sameDateRoomTableQN(opdateth, oproom, newcontent)
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
