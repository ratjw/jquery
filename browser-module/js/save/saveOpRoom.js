
import { OPDATE, THEATRE, OPROOM, CASENUM, QN } from "../model/const.js"
import { OLDCONTENT } from "../control/edit.js"
import { fetchSaveOpRoom } from "../model/fetch.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQN } from "../util/getrows.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewSaveOpRoom } from "../view/view.js"
import { UndoManager } from "../model/UndoManager.js"

export function saveOpRoom(pointed, newcontent) {
	let $cell = $(pointed).closest('tr').children("td"),
		opdateth = $cell[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cell[THEATRE].innerHTML,
		oproom = $cell[OPROOM].innerHTML,
		qn = $cell[QN].innerHTML,
		allOldCases = [],
		allNewCases = []

	allOldCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	allOldCases = allOldCases.filter(e => e !== qn)

	allNewCases = sameDateRoomTableQN(opdateth, newcontent, theatre)
	allNewCases.push(qn)

	let doSaveOpRoom = function() {
		fetchSaveOpRoom(allOldCases, allNewCases, oproom, newcontent, qn).then(response => {
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
		fetchSaveOpRoom(allNewCases, allOldCases, OLDCONTENT, qn).then(response => {
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
