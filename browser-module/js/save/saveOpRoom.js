
import { OPDATE, THEATRE, OPROOM, CASENUM, QN } from "../model/const.js"
import { oldcontent } from "../control/edit.js"
import { fetchSaveOpRoom } from "../model/fetch.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQN } from "../util/getrows.js"
import { Alert, updateBOOK } from "../util/util.js"
import { viewSaveOpRoom } from "../view/fill.js"
import { UndoManager } from "../model/UndoManager.js"

export function saveOpRoom(pointed, newcontent) {
	let $cells = $(pointed).closest('tr').children("td"),
		opdateth = $cell[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cell[THEATRE].innerHTML,
		oproom = $cell[OPROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cells[QN].innerHTML,
		allOldCases = [],
		allNewCases = []

	if (oproom) {
		allOldCases = sameDateRoomTableQN(opdateth, oproom, theatre)
		allOldCases = allOldCases.filter(e => e !== qn)
	}

	if (newcontent) {
		allNewCases = sameDateRoomTableQN(opdateth, newcontent, theatre)
		if (casenum) {
			allNewCases.splice(casenum-1, 0, qn)
		} else {
			allNewCases.push(qn)
		}
	}

	if (!allOldCases.length && !allNewCases.length) { return }

	let doSaveOpRoom = function() {
		fetchSaveOpRoom(allOldCases, allNewCases, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveOpRoom(opdate, staffname)
			};

			typeof response === "object"
			? hasData()
			: Alert ("saveOpRoom", response)
		}).catch(error => {})
	}


	let undoSaveOpRoom = function() {
		fetchSaveOpRoom(allNewCases, allOldCases, oldcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveOpRoom(opdate, staffname)
			};

			typeof response === "object"
			? hasData()
			: Alert ("saveOpRoom", response)
		}).catch(error => {})
	}
	
	doSaveOpRoom()

	// make undo-able
	UndoManager.add({
		undo: function() {
			undoSaveOpRoom()
		},
		redo: function() {
			doSaveOpRoom()
		}
	})		
}
