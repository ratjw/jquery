
import { OPDATE, THEATRE, OPROOM, QN } from "../model/const.js"
import { OLDCONTENT } from "../control/edit.js"
import { fetchSaveOpRoom } from "../model/sqlsavedata.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewOneDay } from "../view/viewOneDay.js"
import { viewSplit } from "../view/viewSplit.js"
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

	allOldCases = sameDateRoomTableQNs(opdateth, oproom, theatre)
	allOldCases = allOldCases.filter(e => e !== qn)

	allNewCases = sameDateRoomTableQNs(opdateth, newcontent, theatre)
	allNewCases.push(qn)

	let doSaveOpRoom = function() {
		fetchSaveOpRoom(allOldCases, allNewCases, oproom, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewOneDay(opdate)
				viewSplit(staffname)
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
				viewOneDay(opdate)
				viewSplit(staffname)
			};

			typeof response === "object"
			? hasData()
			: Alert ("saveOpRoom", response)
		}).catch(error => {})
	}
	
	doSaveOpRoom()

	// make undo-able
/*	UndoManager.add({
		undo: function() {
			undoSaveOpRoom()
		},
		redo: function() {
			doSaveOpRoom()
		}
	})*/
}
